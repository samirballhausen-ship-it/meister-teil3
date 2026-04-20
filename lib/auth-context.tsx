"use client";

/**
 * AuthContext · Firebase Google/Email + Guest-Mode
 *
 * Guest-Mode: localStorage-only (bisheriger Flow bleibt default)
 * Logged-In:  User-Record in Firestore (users-teil3/{uid}) + automatisches Mergen
 *             von Profil und Progress in die Cloud (fire-and-forget)
 */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider, APP_NS } from "./firebase";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest: boolean;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const GUEST_KEY = "meister3-guest";
const COL = `users-${APP_NS}`;

function toAppUser(u: FirebaseUser): AppUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
    isGuest: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Race-Protection: getRedirectResult und onAuthStateChanged können
  // parallel feuern. Wenn ein authentifizierter User gesetzt wurde,
  // soll ein nachfolgendes onAuthStateChanged(null) ihn nicht mehr
  // überschreiben (außer durch explizites signOut).
  const userRef = useRef<AppUser | null>(null);
  const explicitSignOutRef = useRef(false);

  useEffect(() => {
    const log = (...a: unknown[]) => console.log("[auth]", ...a);

    function setUserSafe(next: AppUser | null, source: string) {
      const prev = userRef.current;
      // Wenn vorher ein eingeloggter User da war und jetzt null kommt
      // OHNE expliziten signOut → ignorieren (Race-Protection).
      if (next === null && prev && !prev.isGuest && !explicitSignOutRef.current) {
        log(`[${source}] ignore null-user (already authenticated as ${prev.email})`);
        return;
      }
      userRef.current = next;
      log(`[${source}] setUser:`, next?.email ?? next?.uid ?? "null");
      setUser(next);
    }

    // 1. Redirect-Result einsammeln — muss ZUERST laufen, sonst geht das
    //    Google-Login-Resultat verloren wenn zuvor ein GUEST_KEY gesetzt war.
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          log("redirect-result received:", result.user.email);
          localStorage.removeItem(GUEST_KEY);
          setUserSafe(toAppUser(result.user), "redirect-result");
          setLoading(false);
        } else {
          log("redirect-result: null (kein redirect-flow aktiv)");
        }
      })
      .catch((err) => {
        console.error("[auth] redirect-result error:", err);
      });

    // 2. onAuthStateChanged hat IMMER Vorrang vor GUEST_KEY.
    //    KRITISCH: setLoading(false) läuft SOFORT nach setUser, NICHT nach
    //    dem Firestore-await. Sonst blockiert ein langsamer Firestore-Call
    //    die ganze App (Onboarding-Redirect, ProfileProvider-ready).
    const unsub = onAuthStateChanged(auth, (fu) => {
      log("onAuthStateChanged:", fu?.email ?? "null");
      if (fu) {
        localStorage.removeItem(GUEST_KEY);
        setUserSafe(toAppUser(fu), "onAuthStateChanged");
        setLoading(false);
        // Firestore-User-Doc-Init: fire-and-forget, blockiert nichts.
        (async () => {
          try {
            const ref = doc(db, COL, fu.uid);
            const snap = await getDoc(ref);
            if (!snap.exists()) {
              await setDoc(ref, {
                uid: fu.uid,
                email: fu.email,
                displayName: fu.displayName,
                photoURL: fu.photoURL,
                createdAt: new Date().toISOString(),
              });
              log("user-doc created in Firestore");
            } else {
              log("user-doc exists in Firestore");
            }
          } catch (err) {
            console.warn("[auth] Firestore user-doc init skipped:", err);
          }
        })();
      } else {
        // Kein Firebase-User — entweder Gast oder anonymous
        const isGuest = typeof window !== "undefined" && localStorage.getItem(GUEST_KEY) === "1";
        if (isGuest) {
          log("fallback to guest-mode");
          setUserSafe({ uid: "guest", email: null, displayName: "Gast", photoURL: null, isGuest: true }, "onAuthStateChanged-guest");
        } else {
          setUserSafe(null, "onAuthStateChanged-none");
        }
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  async function signInWithGoogle() {
    console.log("[auth] signInWithGoogle → starting redirect");
    // GUEST_KEY vor Redirect entfernen, damit getRedirectResult beim
    // Zurückkommen nicht durch alten Gast-Flag überschrieben wird.
    localStorage.removeItem(GUEST_KEY);
    try {
      await signInWithRedirect(auth, googleProvider);
      // Promise resolves quickly, browser navigates to Google in kürze
    } catch (err) {
      console.error("[auth] signInWithRedirect failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("auth/unauthorized-domain")) {
        const result = await signInWithPopup(auth, googleProvider);
        const u = toAppUser(result.user);
        userRef.current = u;
        setUser(u);
        return;
      }
      throw err;
    }
  }

  async function signInWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    localStorage.removeItem(GUEST_KEY);
    const u = toAppUser(result.user);
    userRef.current = u;
    setUser(u);
  }

  async function signUpWithEmail(email: string, password: string, name: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    localStorage.removeItem(GUEST_KEY);
    const u = { ...toAppUser(result.user), displayName: name };
    userRef.current = u;
    setUser(u);
  }

  function continueAsGuest() {
    localStorage.setItem(GUEST_KEY, "1");
    const u: AppUser = { uid: "guest", email: null, displayName: "Gast", photoURL: null, isGuest: true };
    userRef.current = u;
    setUser(u);
  }

  async function signOut() {
    explicitSignOutRef.current = true;
    try { await firebaseSignOut(auth); } catch { /* guest */ }
    localStorage.removeItem(GUEST_KEY);
    userRef.current = null;
    setUser(null);
    // Reset Race-Schutz nach kurzer Verzögerung, damit nachfolgende
    // onAuthStateChanged(null)-Events durchkommen.
    setTimeout(() => { explicitSignOutRef.current = false; }, 100);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, continueAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
