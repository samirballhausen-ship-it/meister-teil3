"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useProgress, calcMastery } from "@/lib/progress-context";
import { CLUSTERS, type Cluster, type ThemaFrontmatter } from "@/lib/types";
import { NavBar } from "@/components/nav-bar";
import { ClawbuisFooter } from "@/components/clawbuis-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Calculator, Landmark, Compass, LineChart, Scale, Clock, Target, ChevronRight, Sparkles, CheckCircle2,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Calculator, Landmark, Compass, LineChart, Scale,
};

interface Props {
  themenByCluster: Record<Cluster, ThemaFrontmatter[]>;
}

export function LernenHub({ themenByCluster }: Props) {
  const params = useSearchParams();
  const initial = (params.get("cluster") as Cluster) ?? "all";
  const [activeCluster, setActiveCluster] = useState<Cluster | "all">(initial);
  const { stats, progress } = useProgress();

  const alleThemen = Object.values(themenByCluster).flat();
  const filtered = activeCluster === "all" ? alleThemen : (themenByCluster[activeCluster] ?? []);

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <NavBar />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="gravur text-2xl md:text-3xl font-medium leading-tight">
            Unterricht <span className="text-gradient">aufbereiten</span>.
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Wähle ein Werkfeld oder stöbere durch alle Lektionen.
          </p>
        </motion.div>

        {/* Filter-Chips · besser ausgearbeitet */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
          <Chip
            label="Alle"
            count={alleThemen.length}
            active={activeCluster === "all"}
            onClick={() => setActiveCluster("all")}
            hue={160}
          />
          {CLUSTERS.map((c) => {
            const count = themenByCluster[c.id]?.length ?? 0;
            return (
              <Chip
                key={c.id}
                label={c.short}
                count={count}
                active={activeCluster === c.id}
                onClick={() => setActiveCluster(c.id)}
                hue={c.hue}
              />
            );
          })}
        </div>

        {/* Lektions-Liste */}
        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <Card className="border-dashed border-border/50 bg-card/30">
              <CardContent className="p-8 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Noch keine Lektionen in diesem Werkfeld.</p>
                <p className="text-xs text-muted-foreground mt-1">Kommt mit neuen Unterrichtstagen dazu.</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((t, i) => {
              const cluster = CLUSTERS.find((c) => c.id === t.cluster)!;
              const Icon = ICONS[cluster.icon] ?? BookOpen;
              const done = stats.lessonsCompleted.includes(t.slug);
              // Fragen-Mastery für dieses Thema
              const themaFragen = t.fragen ?? [];
              const masteries = themaFragen
                .map((id) => progress[id])
                .filter((p) => p && p.history.length > 0)
                .map((p) => calcMastery(p));
              const avgMastery = masteries.length === 0 ? 0
                : Math.round(masteries.reduce((s, m) => s + m, 0) / masteries.length);

              return (
                <motion.div
                  key={t.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <Link href={`/lernen/${t.slug}`}>
                    <Card className="border-border/40 hover:border-primary/40 transition-all cursor-pointer group overflow-hidden relative">
                      {/* Mastery-Bar links (subtle) */}
                      {avgMastery > 0 && (
                        <div
                          className="absolute top-0 left-0 w-0.5 h-full"
                          style={{ background: `linear-gradient(180deg, oklch(0.7 0.14 ${cluster.hue}), transparent)` }}
                        />
                      )}
                      <CardContent className="p-4 flex items-center gap-3">
                        <div
                          className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border relative"
                          style={{
                            background: `oklch(0.6 0.12 ${cluster.hue} / 0.12)`,
                            borderColor: `oklch(0.6 0.12 ${cluster.hue} / 0.35)`,
                            color: `oklch(0.78 0.14 ${cluster.hue})`,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                          {done && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-background flex items-center justify-center">
                              <CheckCircle2 className="h-2.5 w-2.5 text-background" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge
                              variant="outline"
                              className="text-[9px] uppercase tracking-widest"
                              style={{ color: `oklch(0.78 0.14 ${cluster.hue})`, borderColor: `oklch(0.6 0.12 ${cluster.hue} / 0.35)` }}
                            >
                              {cluster.short}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" /> {t.dauer_min} min
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Target className="h-2.5 w-2.5" /> {t.schwierigkeit}/5
                            </span>
                            {avgMastery > 0 && (
                              <span className="text-[10px] font-mono" style={{ color: `oklch(0.78 0.14 ${cluster.hue})` }}>
                                {avgMastery}%
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm leading-tight">{t.titel}</h3>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>

        <ClawbuisFooter />
      </main>
    </div>
  );
}

function Chip({
  label, count, active, onClick, hue,
}: {
  label: string; count: number; active: boolean; onClick: () => void; hue: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap"
      style={{
        borderColor: active ? `oklch(0.7 0.14 ${hue})` : "oklch(1 0 0 / 0.1)",
        background: active ? `oklch(0.6 0.12 ${hue} / 0.15)` : "transparent",
        color: active ? `oklch(0.8 0.14 ${hue})` : "var(--muted-foreground)",
        boxShadow: active ? `0 0 12px oklch(0.6 0.12 ${hue} / 0.25)` : undefined,
      }}
    >
      <span>{label}</span>
      <span
        className="inline-flex items-center justify-center h-4 min-w-[18px] px-1 rounded-full text-[9px] font-mono"
        style={{
          background: active ? `oklch(0.6 0.12 ${hue} / 0.3)` : "oklch(1 0 0 / 0.06)",
          color: active ? `oklch(0.85 0.14 ${hue})` : "var(--muted-foreground)",
        }}
      >
        {count}
      </span>
    </motion.button>
  );
}
