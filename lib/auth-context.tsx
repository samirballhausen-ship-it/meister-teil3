"use client";

/**
 * AuthContext · Firebase Google/Email + Guest-Mode
 *
 * Guest-Mode: localStorage-only (bisheriger Flow bleibt default)
 * Logged-In:  User-Record in Firestore (users-teil3/{uid}) + automatisches Mergen
 *             von Profil und Progress in die Cloud (fire-and-forget)
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

  useEffect(() => {
    // Check Guest-Session first
    if (typeof window !== "undefined" && localStorage.getItem(GUEST_KEY) === "1") {
      setUser({ uid: "guest", email: null, displayName: "Gast", photoURL: null, isGuest: true });
      setLoading(false);
      return;
    }

    // Redirect-Result proper handhaben: nach signInWithRedirect bringt
    // Firebase den eingeloggten User zurück. Setzen wir sofort als User.
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          localStorage.removeItem(GUEST_KEY);
          setUser(toAppUser(result.user));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Auth redirect result skipped:", err);
      });

    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (fu) {
        setUser(toAppUser(fu));
        // Ensure user doc exists
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
          console.warn("Firestore user-doc init skipped:", err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function signInWithGoogle() {
    // Redirect-Flow als Default: robust über alle Browser und Mobile, keine
    // Popup-Blocker-Probleme, keine 3rd-Party-Cookie-Hänger. Seite navigiert
    // zu accounts.google.com, kommt zurück, getRedirectResult übernimmt.
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Letzter Fallback: Popup versuchen falls Redirect hart blockiert ist
      if (!msg.includes("auth/unauthorized-domain")) {
        const result = await signInWithPopup(auth, googleProvider);
        localStorage.removeItem(GUEST_KEY);
        setUser(toAppUser(result.user));
        return;
      }
      throw err;
    }
  }

  async function signInWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    localStorage.removeItem(GUEST_KEY);
    setUser(toAppUser(result.user));
  }

  async function signUpWithEmail(email: string, password: string, name: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    localStorage.removeItem(GUEST_KEY);
    setUser({ ...toAppUser(result.user), displayName: name });
  }

  function continueAsGuest() {
    localStorage.setItem(GUEST_KEY, "1");
    setUser({ uid: "guest", email: null, displayName: "Gast", photoURL: null, isGuest: true });
  }

  async function signOut() {
    try { await firebaseSignOut(auth); } catch { /* guest */ }
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
