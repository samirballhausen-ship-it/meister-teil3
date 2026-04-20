"use client";

/**
 * AuthContext · Firebase Google/Email + Guest-Mode
 *
 * NACH TEIL-IV-PATTERN: signInWithPopup statt signInWithRedirect.
 * Popup ist robuster auf Custom-Domains weil keine Cross-Domain-Session-
 * Übertragung nötig ist (alles läuft same-origin im Popup-Window).
 *
 * Guest-Mode: localStorage-only
 * Logged-In:  User-Record in Firestore (users-teil3/{uid})
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
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

const GUEST_USER: AppUser = {
  uid: "guest",
  email: null,
  displayName: "Gast",
  photoURL: null,
  isGuest: true,
};

async function ensureUserDoc(fu: FirebaseUser) {
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
    }
  } catch (err) {
    console.warn("[auth] Firestore user-doc init skipped:", err);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const log = (...a: unknown[]) => console.log("[auth]", ...a);

    // Gast-Session zuerst checken (synchron, aus localStorage)
    if (typeof window !== "undefined" && localStorage.getItem(GUEST_KEY) === "1") {
      log("guest-mode from localStorage");
      setUser(GUEST_USER);
      setLoading(false);
      // onAuthStateChanged-Listener trotzdem registrieren, falls
      // später ein Login passiert (überschreibt Gast-Mode).
    }

    const unsubscribe = onAuthStateChanged(auth, (fu) => {
      log("onAuthStateChanged:", fu?.email ?? "null");
      if (fu) {
        // Eingeloggt → Gast-Flag entfernen, User setzen
        localStorage.removeItem(GUEST_KEY);
        setUser(toAppUser(fu));
        setLoading(false);
        // Firestore-Init im Hintergrund (blockiert nichts)
        void ensureUserDoc(fu);
      } else {
        // Kein Firebase-User. Wenn Gast-Flag gesetzt → Gast bleiben.
        // Sonst: anonymous (Onboarding/Login).
        const isGuest = typeof window !== "undefined" && localStorage.getItem(GUEST_KEY) === "1";
        setUser(isGuest ? GUEST_USER : null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ─── Google Login (POPUP — wie Teil IV) ───────────────────────────
  async function signInWithGoogle() {
    console.log("[auth] signInWithGoogle → opening popup");
    const result = await signInWithPopup(auth, googleProvider);
    // Sofort State setzen — nicht auf onAuthStateChanged warten
    localStorage.removeItem(GUEST_KEY);
    setUser(toAppUser(result.user));
    setLoading(false);
    void ensureUserDoc(result.user);
  }

  async function signInWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    localStorage.removeItem(GUEST_KEY);
    setUser(toAppUser(result.user));
    setLoading(false);
    void ensureUserDoc(result.user);
  }

  async function signUpWithEmail(email: string, password: string, name: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    localStorage.removeItem(GUEST_KEY);
    setUser({ ...toAppUser(result.user), displayName: name });
    setLoading(false);
    void ensureUserDoc(result.user);
  }

  function continueAsGuest() {
    localStorage.setItem(GUEST_KEY, "1");
    setUser(GUEST_USER);
    setLoading(false);
  }

  async function signOut() {
    try { await firebaseSignOut(auth); } catch { /* guest mode */ }
    localStorage.removeItem(GUEST_KEY);
    setUser(null);
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
