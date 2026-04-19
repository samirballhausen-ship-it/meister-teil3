"use client";

/**
 * Dashboard · Teil-IV-inspiriert, unsere Emerald-Amber-Palette
 * Streak + XP + Daily-Goal + Cluster-Progress + Quick Actions + Countdown
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useProfile } from "@/lib/profile-store";
import { useProgress, getLevel, LEVELS } from "@/lib/progress-context";
import { CLUSTERS, type Cluster, type Frage, type ThemaFrontmatter } from "@/lib/types";
import { NavBar } from "@/components/nav-bar";
import { ProgressRing } from "@/components/progress-ring";
import { AnimatedCounter } from "@/components/animated-counter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Flame, Trophy, Target, Zap, ChevronRight, Brain, Gamepad2, Sparkles,
  BookOpen, Calculator, Landmark, Compass, LineChart, Scale, Clock, CalendarDays,
} from "lucide-react";

interface Props {
  master: { fragen: Frage[]; gesamt: number; cluster_count: Record<string, number> };
  contentStats: { fragen_gesamt: number; themen_gesamt: number; tage_erfasst: number; pruefung_datum?: string };
  themenByCluster: Record<Cluster, ThemaFrontmatter[]>;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Calculator, Landmark, Compass, LineChart, Scale,
};

const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };

export function Dashboard({ master, contentStats, themenByCluster }: Props) {
  const { profile, ready } = useProfile();
  const { stats, progress, getHFMastery } = useProgress();
  const router = useRouter();

  useEffect(() => {
    if (ready && !profile) router.push("/onboarding");
  }, [ready, profile, router]);

  if (!ready || !profile) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground">…</div>;
  }

  const firstName = profile.name.split(" ")[0];
  const level = getLevel(stats.xp);
  const nextLevel = LEVELS.find((l) => l.xpRequired > stats.xp);
  const xpToNext = nextLevel ? nextLevel.xpRequired - stats.xp : 0;
  const levelPct = nextLevel
    ? ((stats.xp - level.xpRequired) / (nextLevel.xpRequired - level.xpRequired)) * 100
    : 100;

  const dailyPct = Math.min(100, (stats.dailyGoalProgress / stats.dailyGoalTarget) * 100);
  const overallAnswered = stats.totalQuestionsAnswered;
  const correctRate = overallAnswered === 0 ? 0 : Math.round((stats.totalCorrect / overallAnswered) * 100);

  const daysToExam = contentStats.pruefung_datum
    ? Math.max(0, Math.ceil((new Date(contentStats.pruefung_datum).getTime() - Date.now()) / (86400000)))
    : null;

  const hasAnswered = overallAnswered > 0;

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <NavBar />

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5"
      >
        {/* ─── Hero: Begrüßung + Daily Goal ─────────────────────────── */}
        <motion.div variants={fadeUp}>
          <Card className="border-border/30 bg-card/60 backdrop-blur-sm overflow-hidden relative">
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-col md:flex-row items-center gap-5">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 140, delay: 0.15 }}
                >
                  <ProgressRing progress={dailyPct} size={100} strokeWidth={7}>
                    <div className="text-center">
                      <p className="gravur text-xl font-semibold leading-none">{stats.dailyGoalProgress}</p>
                      <p className="text-[8px] text-muted-foreground">/ {stats.dailyGoalTarget}</p>
                      <p className="text-[8px] uppercase tracking-wider text-primary mt-0.5">heute</p>
                    </div>
                  </ProgressRing>
                </motion.div>
                <div className="flex-1 text-center md:text-left space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{greeting()}</p>
                    <h1 className="gravur text-2xl md:text-3xl font-medium mt-0.5">
                      {firstName}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      {!hasAnswered
                        ? "Zeit für die erste Frage."
                        : dailyPct >= 100
                          ? "Tagesziel geschafft — weiter so!"
                          : `Noch ${stats.dailyGoalTarget - stats.dailyGoalProgress} bis zum Tagesziel.`}
                    </p>
                  </div>
                  <div className="flex gap-2.5 justify-center md:justify-start">
                    <Link href="/pruefung/session?mode=mix&count=10">
                      <Button size="lg" className="rounded-xl h-11 px-5 text-sm shadow-lg shadow-primary/20">
                        <Zap className="mr-1.5 h-4 w-4" />
                        {hasAnswered ? "Weiter lernen" : "Erste Frage"}
                      </Button>
                    </Link>
                    <Link href="/lernen">
                      <Button variant="outline" size="lg" className="rounded-xl h-11 px-4 text-sm">
                        <BookOpen className="mr-1.5 h-4 w-4" />
                        Lektionen
                      </Button>
                    </Link>
                  </div>
                </div>
                {/* Level-Badge rechts */}
                <div className="hidden lg:flex flex-col items-center min-w-[120px] bg-muted/30 rounded-xl p-3 border border-border/40">
                  <div className="text-3xl mb-1">{level.icon}</div>
                  <p className="text-sm font-semibold">{level.title}</p>
                  {nextLevel && (
                    <>
                      <Progress value={levelPct} className="h-1 mt-2 w-full" />
                      <p className="text-[9px] text-muted-foreground mt-1">{xpToNext.toLocaleString("de-DE")} XP → {nextLevel.title}</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── KPI-Zeile ───────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          <KPI icon={Flame} color="text-orange-400" value={stats.currentStreak} label="Tage Streak" />
          <KPI icon={Trophy} color="text-xp"         value={stats.xp}            label={`XP · ${level.icon}`} />
          <KPI icon={Target} color="text-primary"    value={correctRate}         label="Richtig-Quote" suffix="%" />
        </motion.div>

        {/* ─── Prüfungs-Countdown ──────────────────────────────────── */}
        {daysToExam !== null && (
          <motion.div variants={fadeUp}>
            <Card className="border-accent/30 bg-gradient-to-r from-accent/8 via-accent/3 to-transparent backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center animate-pulse-amber">
                  <CalendarDays className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-accent">bis zur Prüfung</p>
                  <p className="gravur text-2xl font-medium">
                    <AnimatedCounter value={daysToExam} /> Tage
                  </p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-[10px] text-muted-foreground">Ziel</p>
                  <p className="text-sm font-mono">{contentStats.pruefung_datum}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Werkfelder-Übersicht ────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="gravur text-base font-semibold">Werkfelder</h2>
            <Badge variant="secondary" className="text-[10px]">
              {contentStats.themen_gesamt} Themen · {contentStats.fragen_gesamt} Fragen
            </Badge>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CLUSTERS.map((c) => {
            const clusterFragen = master.fragen.filter((q) => q.cluster === c.id).map((q) => q.id);
            const m = getHFMastery(c.id, clusterFragen);
            const themenCount = themenByCluster[c.id]?.length ?? 0;
            const Icon = ICONS[c.icon] ?? BookOpen;
            const hue = c.hue;
            return (
              <motion.div key={c.id} variants={fadeUp} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                <Link href={`/lernen?cluster=${c.id}`}>
                  <Card
                    className="relative overflow-hidden border-border/40 hover:border-primary/40 transition-all cursor-pointer group"
                    style={{ background: `radial-gradient(circle at 10% 10%, oklch(0.6 0.12 ${hue} / 0.12), transparent 55%)` }}
                  >
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{
                            background: `oklch(0.6 0.12 ${hue} / 0.15)`,
                            borderColor: `oklch(0.6 0.12 ${hue} / 0.4)`,
                            color: `oklch(0.7 0.14 ${hue})`,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm leading-tight">{c.label}</h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {themenCount} Themen · {clusterFragen.length} Fragen
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                      </div>
                      <div className="mt-3.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">
                            {m.gesehen > 0 ? `${m.gesehen} bearbeitet · ${m.gemeistert} gemeistert` : "Noch nicht begonnen"}
                          </span>
                          <span className="font-medium font-mono" style={{ color: `oklch(0.75 0.14 ${hue})` }}>
                            {m.avg}%
                          </span>
                        </div>
                        <Progress value={m.avg} className="h-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Quick Actions ──────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-3 gap-3">
            <QuickAction href="/pruefung/session?mode=exam&count=41" icon={Brain}   color="destructive" title="Probeklausur" desc="41 · 60 min" />
            <QuickAction href="/pause"                                icon={Gamepad2} color="accent"      title="Pausenspiele" desc="Mini-Games" />
            <QuickAction href="/lernen"                               icon={Sparkles} color="primary"     title="Entdecken"    desc="Lektionen" />
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}

function KPI({
  icon: Icon, color, value, label, suffix = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  value: number;
  label: string;
  suffix?: string;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-xl bg-card/50 backdrop-blur-sm border border-border/40 p-3 md:p-4 text-center">
      <Icon className={`h-5 w-5 ${color} mx-auto mb-1 drop-shadow-[0_0_6px_currentColor]`} />
      <p className="gravur text-xl md:text-2xl font-semibold"><AnimatedCounter value={value} />{suffix}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

function QuickAction({
  href, icon: Icon, color, title, desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "primary" | "accent" | "destructive";
  title: string;
  desc: string;
}) {
  const colorMap = {
    primary:     { bg: "bg-primary/10",     border: "hover:border-primary/40",     text: "text-primary",     icon: "text-primary" },
    accent:      { bg: "bg-accent/10",      border: "hover:border-accent/40",      text: "text-accent",      icon: "text-accent" },
    destructive: { bg: "bg-destructive/10", border: "hover:border-destructive/40", text: "text-destructive", icon: "text-destructive" },
  }[color];
  return (
    <Link href={href}>
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
        <Card className={`border-border/40 ${colorMap.border} bg-card/40 transition-all cursor-pointer group`}>
          <CardContent className="p-3.5 md:p-4 text-center">
            <div className={`h-10 w-10 mx-auto rounded-xl ${colorMap.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
              <Icon className={`h-5 w-5 ${colorMap.icon}`} />
            </div>
            <p className="text-sm font-semibold leading-tight">{title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6)  return "Noch wach";
  if (h < 11) return "Guten Morgen";
  if (h < 14) return "Mittag";
  if (h < 18) return "Guten Tag";
  if (h < 22) return "Guten Abend";
  return "Späte Session";
}
