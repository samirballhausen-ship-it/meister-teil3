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

    // Redirect-Result einsammeln (Mobile-Fallback nach signInWithRedirect)
    getRedirectResult(auth).catch((err) => {
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
    const isMobile = typeof window !== "undefined" &&
      /Android|iPhone|iPad|iPod|Opera Mini|Mobile/i.test(window.navigator.userAgent);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.removeItem(GUEST_KEY);
      setUser(toAppUser(result.user));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Popup geblockt oder Mobile ohne Popup-Support → Redirect-Fallback
      if (isMobile || msg.includes("popup-blocked") || msg.includes("popup-closed") || msg.includes("cancelled-popup-request")) {
        await signInWithRedirect(auth, googleProvider);
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
