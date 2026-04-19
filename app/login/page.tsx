"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Sparkles, Hammer } from "lucide-react";

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, continueAsGuest } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showAccount, setShowAccount] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleGuest() {
    continueAsGuest();
    router.push("/");
  }

  async function handleGoogle() {
    try {
      setBusy(true); setError("");
      await signInWithGoogle();
      router.push("/");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("unauthorized-domain")) {
        setError("Diese Domain ist nicht für Google-Login freigegeben. Melde dich später an oder starte als Gast.");
      } else {
        setError(`Google-Login fehlgeschlagen: ${msg}`);
      }
    } finally { setBusy(false); }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true); setError("");
      if (mode === "login") await signInWithEmail(email, password);
      else                  await signUpWithEmail(email, password, name);
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("invalid-credential") || msg.includes("user-not-found")) setError("Kein Account gefunden. Bitte registrieren.");
      else if (msg.includes("wrong-password")) setError("Falsches Passwort.");
      else if (msg.includes("email-already-in-use")) setError("E-Mail bereits registriert.");
      else if (msg.includes("weak-password")) setError("Passwort zu kurz (min. 6 Zeichen).");
      else setError(msg);
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-dvh relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-accent/6 blur-[80px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className="w-full max-w-md relative z-10">
        <div className="text-center mb-7">
          <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 180, delay: 0.15 }}
                      className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/12 border border-primary/30 mb-4">
            <Hammer className="h-7 w-7 text-primary" />
          </motion.div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent mb-1">Meister-Atelier</p>
          <h1 className="gravur text-3xl font-medium leading-tight">
            <span className="text-gradient">Teil III</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">Wirtschaft · Recht · Kalkulation</p>
        </div>

        <Button onClick={handleGuest} disabled={busy} size="lg"
                className="w-full h-14 rounded-2xl text-base font-semibold mb-3 shadow-lg shadow-primary/20">
          <Sparkles className="mr-2 h-5 w-5" /> Direkt loslegen
        </Button>
        <p className="text-center text-xs text-muted-foreground mb-5">Sofort lernen – kein Account nötig</p>

        <button onClick={() => setShowAccount(!showAccount)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
          {showAccount ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {showAccount ? "Weniger Optionen" : "Account · Fortschritt sichern"}
        </button>

        {showAccount && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}>
            <Card className="border-border/30 bg-card/60 backdrop-blur-xl mt-2">
              <CardContent className="p-5">
                <Button variant="outline" className="w-full mb-3 h-11" onClick={handleGoogle} disabled={busy}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Mit Google anmelden
                </Button>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-[10px] uppercase tracking-widest text-muted-foreground">oder E-Mail</span>
                  </div>
                </div>

                {error && <div className="mb-3 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">{error}</div>}

                <div className="grid grid-cols-2 gap-1 mb-3 p-1 rounded-lg bg-muted/40">
                  <button onClick={() => setMode("login")} className={`py-1.5 text-xs rounded-md ${mode === "login" ? "bg-card text-foreground" : "text-muted-foreground"}`}>Anmelden</button>
                  <button onClick={() => setMode("register")} className={`py-1.5 text-xs rounded-md ${mode === "register" ? "bg-card text-foreground" : "text-muted-foreground"}`}>Registrieren</button>
                </div>

                <form onSubmit={handleEmail} className="space-y-2.5">
                  {mode === "register" && (
                    <div><Label htmlFor="n" className="text-xs">Name</Label><Input id="n" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                  )}
                  <div><Label htmlFor="e" className="text-xs">E-Mail</Label><Input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div><Label htmlFor="p" className="text-xs">Passwort</Label><Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {mode === "login" ? "Anmelden" : "Account erstellen"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
