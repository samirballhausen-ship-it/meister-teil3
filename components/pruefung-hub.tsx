"use client";

import Link from "next/link";
import { useProgress, calcMastery } from "@/lib/progress-context";
import { NavBar } from "@/components/nav-bar";
import { ClawbuisFooter } from "@/components/clawbuis-badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import { Zap, Flame, Crosshair, FileWarning, Shuffle, Target, Trophy, Clock, Sparkles, ChevronRight } from "lucide-react";

interface Props { gesamtFragen: number; }

export function PruefungHub({ gesamtFragen }: Props) {
  const { progress, stats } = useProgress();
  const allIds = Object.keys(progress);
  const bearbeitet = allIds.filter((id) => progress[id].history.length > 0).length;
  const schwach = allIds.filter((id) => {
    const m = calcMastery(progress[id]);
    return m < 50 && progress[id].history.length > 0;
  }).length;
  const durchschnitt = bearbeitet === 0 ? 0 : Math.round(
    allIds.reduce((s, id) => s + calcMastery(progress[id]), 0) / Math.max(allIds.length, 1)
  );

  const modi = [
    {
      id: "blitz", icon: Zap, title: "Blitz", desc: "10 Fragen · schneller Mix", color: "primary" as const,
      href: "/pruefung/session?mode=mix&count=10",
    },
    {
      id: "schwach", icon: Flame, title: "Schwachstellen", desc: `${schwach} unter 50 % Mastery`, color: "destructive" as const,
      href: "/pruefung/session?mode=schwach&count=15",
      disabled: schwach === 0,
    },
    {
      id: "thema", icon: Crosshair, title: "Thema wählen", desc: "Ein Werkfeld gezielt trainieren", color: "accent" as const,
      href: "/lernen",
    },
    {
      id: "zufall", icon: Shuffle, title: "Zufall", desc: "20 Fragen quer durch alle Felder", color: "primary" as const,
      href: "/pruefung/session?mode=neu&count=20",
    },
    {
      id: "ernstfall", icon: FileWarning, title: "Probeklausur", desc: `Alle ${gesamtFragen} · Klausur-Format`, color: "destructive" as const,
      href: `/pruefung/session?mode=exam&count=${gesamtFragen}`,
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <NavBar />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="gravur text-2xl md:text-3xl font-medium leading-tight">
            <span className="text-gradient">Prüfung</span> üben.
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Der Algorithmus wählt adaptiv · schwache zuerst · überfällige bevorzugt.
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={Target} label="Bearbeitet" value={bearbeitet} sub={`/ ${gesamtFragen}`} />
          <KPI icon={Trophy} label="Ø-Mastery" value={durchschnitt} suffix="%" color="text-primary" />
          <KPI icon={Flame}  label="Streak" value={stats.currentStreak} color="text-orange-400" />
          <KPI icon={Clock}  label="XP" value={stats.xp} color="text-xp" />
        </div>

        {/* Highlighted Ernstfall-Banner */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Link href={`/pruefung/session?mode=exam&count=${gesamtFragen}`}>
            <Card className="relative overflow-hidden cursor-pointer border-destructive/40 bg-gradient-to-br from-destructive/15 via-destructive/5 to-transparent hover:border-destructive/70 transition-all group animate-pulse-glow">
              <div className="absolute top-0 right-0 h-full w-60 bg-gradient-to-l from-destructive/10 to-transparent pointer-events-none" />
              <CardContent className="p-5 md:p-6 flex items-center gap-4 relative">
                <div className="h-14 w-14 rounded-2xl bg-destructive/20 border border-destructive/40 flex items-center justify-center shrink-0">
                  <FileWarning className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-destructive mb-0.5">Ernstfall · 60 min</p>
                  <h2 className="gravur text-xl md:text-2xl font-medium">Probeklausur</h2>
                  <p className="text-xs text-muted-foreground mt-1">Alle {gesamtFragen} Fragen · echtes HWK-Format · unter Druck</p>
                </div>
                <ChevronRight className="h-5 w-5 text-destructive group-hover:translate-x-1 transition-transform shrink-0" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Modi (ohne Ernstfall) */}
        <div className="space-y-3">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground pt-2">Weitere Modi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modi.filter((m) => !m.highlight).map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                {m.disabled ? (
                  <Card className="border-border/40 bg-card/30 opacity-50 cursor-not-allowed">
                    <CardContent className="p-5 flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                        <m.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{m.title}</p>
                        <p className="text-xs text-muted-foreground">Noch keine schwachen Fragen</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Link href={m.href}>
                    <Card className="border-border/40 hover:border-primary/40 bg-card/50 transition-all cursor-pointer group h-full">
                      <CardContent className="p-5 flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                          m.color === "destructive" ? "bg-destructive/15 border border-destructive/30 text-destructive" :
                          m.color === "accent"      ? "bg-accent/15 border border-accent/30 text-accent" :
                                                      "bg-primary/15 border border-primary/30 text-primary"
                        }`}>
                          <m.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{m.title}</p>
                          <p className="text-xs text-muted-foreground">{m.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <ClawbuisFooter />
      </main>
    </div>
  );
}

function KPI({
  icon: Icon, label, value, suffix = "", sub, color = "text-foreground",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; suffix?: string; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-3">
      <Icon className={`h-4 w-4 ${color} mb-1`} />
      <p className="gravur text-xl font-semibold">{value.toLocaleString("de-DE")}{suffix}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
        {label} {sub && <span className="normal-case">{sub}</span>}
      </p>
    </div>
  );
}
