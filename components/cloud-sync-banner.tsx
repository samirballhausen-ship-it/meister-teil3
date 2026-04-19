"use client";

/**
 * CloudSyncBanner · Google-Login-Prompt für Gast-User
 *
 * Zwei Varianten:
 *  - variant="full"    = für Onboarding-Screen (als Hauptkarte)
 *  - variant="compact" = für Dashboard als Banner oben
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import { Check, Cloud, X } from "lucide-react";

interface Props {
  variant?: "full" | "compact";
  onDone?: () => void;
}

export function CloudSyncBanner({ variant = "compact", onDone }: Props) {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (loading) return null;
  if (user && !user.isGuest) return null;
  if (dismissed && variant === "compact") return null;

  async function handleGoogle() {
    try {
      setBusy(true); setError(null);
      await signInWithGoogle();
      onDone?.();
      if (variant === "full") router.push("/");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("unauthorized-domain")) {
        setError("Google-Login noch nicht freigegeben. Starte als Gast und versuche es später.");
      } else if (msg.includes("popup-closed")) {
        setError("Login abgebrochen.");
      } else {
        setError(msg.slice(0, 140));
      }
    } finally {
      setBusy(false);
    }
  }

  if (variant === "compact") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="relative rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent p-4 overflow-hidden"
          style={{ boxShadow: "0 0 24px oklch(0.7 0.14 75 / 0.12)" }}
        >
          <button
            aria-label="Ausblenden"
            onClick={() => setDismissed(true)}
            className="absolute top-2.5 right-2.5 h-6 w-6 rounded-lg hover:bg-card/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="h-10 w-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center shrink-0 animate-pulse-glow">
              <Cloud className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="gravur text-sm md:text-base font-medium mb-0.5">
                <span className="text-gradient">Fortschritt sichern · geräteübergreifend</span>
              </p>
              <p className="text-[11px] md:text-xs text-muted-foreground mb-3 leading-relaxed">
                Mit Google anmelden — dein Lern-Stand läuft auf Handy, Tablet und PC mit.
                Lokal bleibt weiter möglich.
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleGoogle}
                  disabled={busy}
                  className="h-9 px-3.5 rounded-lg bg-card/80 hover:bg-card border border-border hover:border-primary/50 flex items-center gap-2 text-xs font-medium transition-colors disabled:opacity-60"
                >
                  <GoogleG />
                  <span>Mit Google anmelden</span>
                </button>
              </div>
              {error && <p className="mt-2 text-[10px] text-destructive">{error}</p>}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // full variant (Onboarding)
  return (
    <div className="rounded-2xl bg-card/60 border border-accent/40 backdrop-blur-sm p-5 space-y-3 shadow-xl shadow-accent/10">
      <div className="flex items-center gap-2 justify-center">
        <Cloud className="h-4 w-4 text-accent" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-accent font-medium">Cloud-Sync aktivieren</p>
      </div>
      <button
        onClick={handleGoogle}
        disabled={busy}
        className="w-full h-12 rounded-xl bg-background/60 hover:bg-background border border-border hover:border-primary/50 flex items-center justify-center gap-2.5 text-sm font-medium transition-colors disabled:opacity-60"
      >
        <GoogleG />
        <span>Mit Google anmelden</span>
      </button>
      <div className="space-y-1">
        <Feature text="Fortschritt auf allen Geräten" />
        <Feature text="Level, Streaks, Mastery bleiben erhalten" />
        <Feature text="Kein Passwort · jederzeit abmeldbar" />
      </div>
      {error && <p className="text-[11px] text-destructive text-center">{error}</p>}
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
      <Check className="h-3 w-3 text-accent shrink-0" /> {text}
    </p>
  );
}

function GoogleG() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
