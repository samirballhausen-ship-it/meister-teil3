"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { useProfile } from "@/lib/profile-store";
import { useAuth } from "@/lib/auth-context";
import { useProgress, getLevel, LEVELS } from "@/lib/progress-context";
import { ACHIEVEMENTS } from "@/lib/types";
import { NavBar } from "@/components/nav-bar";
import { ClawbuisPortal } from "@/components/clawbuis-portal";
import { AchievementBadge, type AchievementIconKey } from "@/components/achievement-badge";
import { LevelEmblem } from "@/components/level-emblem";
import { LevelProgressionModal } from "@/components/level-progression-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Trophy, Flame, Target, BookOpen, ChevronRight, Cloud, Trash2 } from "lucide-react";

interface Props { gesamtFragen: number; gesamtThemen: number; }

export function ProfilSeite({ gesamtFragen, gesamtThemen }: Props) {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const { user, signOut } = useAuth();
  const { stats, resetAll } = useProgress();
  const [levelModalOpen, setLevelModalOpen] = useState(false);

  const isLoggedIn = !!user && !user.isGuest;

  async function handleSignOut() {
    if (!confirm("Abmelden? Dein Fortschritt bleibt in der Cloud erhalten, wird aber lokal gelöscht — beim nächsten Login ist er wieder da.")) return;
    await signOut();
    // Lokalen Cache leeren, damit kein Fremd-Profil liegenbleibt
    resetAll();
    setProfile(null);
    router.push("/onboarding");
  }

  if (!profile) return null;

  const level = getLevel(stats.xp);
  const nextLevel = LEVELS.find((l) => l.xpRequired > stats.xp);

  const correctRate = stats.totalQuestionsAnswered === 0 ? 0 : Math.round((stats.totalCorrect / stats.totalQuestionsAnswered) * 100);

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5">
        {/* ─── Meister-Siegel Hero · klickbar ─────────────────────── */}
        <motion.button
          onClick={() => setLevelModalOpen(true)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full text-left"
        >
          <Card className="border-border/40 bg-gradient-to-br from-card/70 via-card/40 to-accent/5 overflow-hidden relative group">
            {/* Atmosphere-Glow */}
            <div aria-hidden className="absolute inset-0 pointer-events-none opacity-60">
              <div className="absolute top-0 right-1/4 w-48 h-48 rounded-full bg-accent/15 blur-3xl" />
              <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
            </div>

            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

            <CardContent className="p-6 relative flex items-center gap-5">
              {/* Meister-Siegel */}
              <motion.div
                animate={{ rotate: [0, -2, 2, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="shrink-0"
              >
                <LevelEmblem level={level.level} active achieved size={88} />
              </motion.div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.3em] text-accent mb-1">Meister-Siegel · Stufe {level.level}/8</p>
                <h1 className="gravur text-2xl md:text-3xl font-medium">{profile.name}</h1>
                <p className="text-sm text-accent font-medium mt-0.5">{level.title}</p>
                {nextLevel && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {(nextLevel.xpRequired - stats.xp).toLocaleString("de-DE")} XP bis <span className="text-accent">{nextLevel.title}</span>
                  </p>
                )}
              </div>

              {/* Chevron */}
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
            </CardContent>

            {/* Hint-Badge unten */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">
              Tippen · Weg anschauen
            </div>
          </Card>
        </motion.button>

        <LevelProgressionModal
          open={levelModalOpen}
          onClose={() => setLevelModalOpen(false)}
          currentXp={stats.xp}
          currentLevel={level.level}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile icon={Trophy} label="XP" value={stats.xp} color="text-xp" />
          <StatTile icon={Flame}  label="Streak" value={stats.currentStreak} color="text-orange-400" />
          <StatTile icon={Target} label="Richtig" value={correctRate} suffix="%" color="text-primary" />
          <StatTile icon={BookOpen} label="Lektionen" value={stats.lessonsCompleted.length} sub={`/ ${gesamtThemen}`} color="text-accent" />
        </div>

        {/* Zunft-Orden */}
        <div>
          <h2 className="gravur text-base font-semibold mb-3">Zunft-Orden</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5">
            {ACHIEVEMENTS.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <AchievementBadge
                  id={a.id as AchievementIconKey}
                  owned={stats.achievements.includes(a.id)}
                  title={a.title}
                  description={a.description}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lifetime */}
        <Card className="border-border/40 bg-card/30">
          <CardContent className="p-4 space-y-1 text-xs text-muted-foreground">
            <Row label="Fragen insgesamt" value={stats.totalQuestionsAnswered} />
            <Row label="Davon richtig" value={stats.totalCorrect} />
            <Row label="Längste Streak" value={stats.longestStreak} suffix=" Tage" />
            <Row label="Katalog-Umfang" value={gesamtFragen} suffix=" Fragen" />
          </CardContent>
        </Card>

        {/* CLAWBUIS Portal */}
        <ClawbuisPortal />

        {/* Account & Reset */}
        <Card className="border-border/40 bg-card/30">
          <CardContent className="p-4 space-y-3">
            {/* Account-Status */}
            {isLoggedIn ? (
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 flex items-center gap-3">
                {user?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="" className="h-10 w-10 rounded-lg object-cover border border-accent/40" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
                    <span className="gravur text-sm font-semibold text-accent">{(user?.displayName ?? user?.email ?? "U").slice(0, 1).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-accent flex items-center gap-1"><Cloud className="h-2.5 w-2.5" /> Cloud-Sync aktiv</p>
                  <p className="text-xs text-foreground truncate">{user?.email ?? user?.displayName}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">Du spielst lokal · kein Cloud-Sync</p>
              </div>
            )}

            {isLoggedIn && (
              <Button
                variant="outline"
                className="w-full border-accent/40 text-accent hover:bg-accent/10 hover:text-accent"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" /> Abmelden
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                if (confirm("Wirklich alles zurücksetzen? Profil + Fortschritt + Stats werden lokal gelöscht.")) {
                  resetAll();
                  setProfile(null);
                  router.push("/onboarding");
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Alles zurücksetzen
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, suffix = "", sub, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; suffix?: string; sub?: string; color: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-3 text-center">
      <Icon className={`h-5 w-5 mx-auto mb-1 ${color} drop-shadow-[0_0_6px_currentColor]`} />
      <p className="gravur text-xl font-semibold">{value.toLocaleString("de-DE")}{suffix}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}{sub && <span className="normal-case"> {sub}</span>}</p>
    </div>
  );
}

function Row({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-mono font-semibold text-foreground">{value.toLocaleString("de-DE")}{suffix}</span>
    </div>
  );
}
