"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useProfile } from "@/lib/profile-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClawbuisMark } from "@/components/clawbuis-mark";
import { ClawbuisCompact } from "@/components/clawbuis-badge";
import { ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile } = useProfile();
  const [name, setName] = useState("");
  const canGo = name.trim().length >= 2;

  function commit() {
    if (!canGo) return;
    setProfile({ name: name.trim(), erstelltAm: Date.now() });
    router.push("/");
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 py-10 relative">
      {/* Ambient Glows */}
      <div aria-hidden className="absolute inset-0 pointer-events-none opacity-70">
        <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md text-center space-y-8"
      >
        <div>
          {/* CLAWBUIS-Logo prominent oben */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, rotateY: -20 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
            className="inline-flex h-20 w-20 rounded-2xl bg-primary/15 border border-primary/30 items-center justify-center mb-5 animate-pulse-glow"
          >
            <ClawbuisMark className="h-11 w-11" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="gravur text-3xl md:text-4xl font-medium leading-tight"
          >
            Willkommen im <span className="text-gradient">Meister-Atelier</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-muted-foreground mt-2"
          >
            Bevor es losgeht — wie sollen wir dich nennen?
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-2xl bg-card/60 border border-border backdrop-blur-sm p-5 space-y-4 shadow-xl shadow-black/20"
        >
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            placeholder="Dein Vorname"
            maxLength={30}
            className="h-12 text-center text-lg gravur bg-background/60"
          />
          <Button size="lg" disabled={!canGo} onClick={commit} className="w-full h-12 text-base rounded-xl shadow-lg shadow-primary/20">
            Los geht&apos;s <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Alles bleibt auf deinem Gerät · kein Konto · kein Tracking
          </p>
        </motion.div>

        {/* CLAWBUIS-Compact-Badge darunter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="pt-4"
        >
          <ClawbuisCompact />
        </motion.div>
      </motion.div>
    </main>
  );
}
