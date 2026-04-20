"use client";

/**
 * Profile-Store · localStorage + optional Firestore-Sync bei Login
 *
 * Guest: nur localStorage
 * Logged-in: Firestore doc `profile-teil3/{uid}` wird authoritativ,
 *            localStorage dient als Cache + Offline-Fallback.
 */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, APP_NS } from "./firebase";
import { useAuth } from "./auth-context";

export interface UserProfile {
  name: string;
  erstelltAm: number;
  pruefungsDatum?: string;
}

const KEY = "meister3-profile";
const COL = `profile-${APP_NS}`;

interface Ctx {
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
  ready: boolean;
}

const Context = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const lastUidRef = useRef<string | null>(null);

  // Initial load: localStorage immer — als Instant-Cache
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setProfileState(raw ? JSON.parse(raw) : null);
    } catch {}
  }, []);

  // Firestore-Sync: wechselt bei Login/Logout
  useEffect(() => {
    if (authLoading) return;

    if (!user || user.isGuest) {
      setReady(true);
      lastUidRef.current = null;
      return;
    }

    const uid = user.uid;
    if (lastUidRef.current === uid) { setReady(true); return; }
    lastUidRef.current = uid;

    // KRITISCH: ready=true SOFORT setzen + Bootstrap-Profile sofort setzen,
    // damit Dashboard nicht auf Firestore-Roundtrip wartet. Cloud-Sync läuft
    // dann fire-and-forget im Hintergrund.
    const autoName = (user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Meister").trim();
    const autoProfile: UserProfile = { name: autoName, erstelltAm: Date.now() };
    const localRaw = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();
    const bootstrap = localRaw ? (JSON.parse(localRaw) as UserProfile) : autoProfile;

    console.log("[profile] bootstrap:", bootstrap.name, "uid:", uid);
    setProfileState(bootstrap);
    if (!localRaw) {
      try { localStorage.setItem(KEY, JSON.stringify(bootstrap)); } catch {}
    }
    setReady(true);

    // Cloud-Sync im Hintergrund — überschreibt Bootstrap nur wenn Cloud-Daten existieren
    (async () => {
      try {
        const ref = doc(db, COL, uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const cloud = snap.data() as UserProfile;
          console.log("[profile] cloud-loaded:", cloud.name);
          setProfileState(cloud);
          try { localStorage.setItem(KEY, JSON.stringify(cloud)); } catch {}
        } else {
          // Cloud leer → unser Bootstrap hochpushen
          await setDoc(ref, bootstrap);
          console.log("[profile] cloud-pushed bootstrap");
        }
      } catch (err) {
        // Firestore unavailable — App läuft trotzdem mit Bootstrap weiter
        console.warn("[profile] cloud-sync skipped:", err);
      }
    })();
  }, [user, authLoading]);

  const setProfile = (p: UserProfile | null) => {
    if (p) localStorage.setItem(KEY, JSON.stringify(p));
    else    localStorage.removeItem(KEY);
    setProfileState(p);

    if (user && !user.isGuest) {
      const ref = doc(db, COL, user.uid);
      (p ? setDoc(ref, p) : deleteDoc(ref)).catch((err) =>
        console.warn("Profile cloud-save skipped:", err)
      );
    }
  };

  return <Context.Provider value={{ profile, setProfile, ready }}>{children}</Context.Provider>;
}

export function useProfile() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useProfile must be inside ProfileProvider");
  return ctx;
}
