"use client";

/**
 * Profile-Store · localStorage mit React-Context
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface UserProfile {
  name: string;
  erstelltAm: number;
  pruefungsDatum?: string;
}

const KEY = "meister3-profile";

interface Ctx {
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
  ready: boolean;
}

const Context = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setProfileState(raw ? JSON.parse(raw) : null);
    } catch {}
    setReady(true);
  }, []);

  const setProfile = (p: UserProfile | null) => {
    if (p) localStorage.setItem(KEY, JSON.stringify(p));
    else localStorage.removeItem(KEY);
    setProfileState(p);
  };

  return <Context.Provider value={{ profile, setProfile, ready }}>{children}</Context.Provider>;
}

export function useProfile() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useProfile must be inside ProfileProvider");
  return ctx;
}
