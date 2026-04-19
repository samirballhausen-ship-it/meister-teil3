"use client";

/**
 * Meister-Atlas · 2-Ebenen-Mindmap
 *
 * Ebene 1 (Galaxie):   Zentrum + 6 Cluster-Knoten im Hexagon · Übersicht
 * Ebene 2 (Mindmap):   Ein Cluster wird zum Hub, alle Themen fächern sich auf
 *                      als saubere Mindmap-Karten. Alles auf einen Blick.
 *
 * Übergang: Framer-Motion-Crossfade + Scale. Clean, ohne Pseudo-Zoom.
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useProgress, getLevel, calcMastery } from "@/lib/progress-context";
import { CLUSTERS, type Cluster, type Frage, type ThemaFrontmatter } from "@/lib/types";
import { NavBar } from "@/components/nav-bar";
import { ClawbuisPortal } from "@/components/clawbuis-portal";
import { LevelEmblem } from "@/components/level-emblem";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Clock, Target, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

interface Props {
  master: { fragen: Frage[]; gesamt: number };
  themenByCluster: Record<Cluster, ThemaFrontmatter[]>;
  pruefungsDatum?: string;
}

type Filter = "alle" | "offen" | "schwach" | "meisterlich";

export function MeisterAtlas({ master, themenByCluster, pruefungsDatum }: Props) {
  const { progress, stats } = useProgress();
  const level = getLevel(stats.xp);
  const [focusCluster, setFocusCluster] = useState<Cluster | null>(null);
  const [filter, setFilter] = useState<Filter>("alle");

  const daysToExam = useMemo(() => {
    if (!pruefungsDatum) return null;
    return Math.max(0, Math.ceil((new Date(pruefungsDatum + "T09:00:00").getTime() - Date.now()) / 86400000));
  }, [pruefungsDatum]);

  function themaMastery(t: ThemaFrontmatter): number {
    const fids = t.fragen ?? [];
    const vals = fids.map((id) => progress[id]).filter(Boolean);
    if (vals.length === 0) return 0;
    return Math.round(vals.map((p) => calcMastery(p)).reduce((s, v) => s + v, 0) / vals.length);
  }

  function matchesFilter(t: ThemaFrontmatter): boolean {
    const m = themaMastery(t);
    const seen = (t.fragen ?? []).some((id) => progress[id]);
    if (filter === "alle") return true;
    if (filter === "offen") return m < 100;
    if (filter === "schwach") return seen && m < 50;
    if (filter === "meisterlich") return m >= 90;
    return true;
  }

  const overviewStats = useMemo(() => {
    const all = Object.values(themenByCluster).flat();
    return {
      total: all.length,
      begonnen: all.filter((t) => (t.fragen ?? []).some((id) => progress[id])).length,
      meisterlich: all.filter((t) => themaMastery(t) >= 90).length,
      schwach: all.filter((t) => {
        const seen = (t.fragen ?? []).some((id) => progress[id]);
        return seen && themaMastery(t) < 50;
      }).length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themenByCluster, progress]);

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <NavBar />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5">
        {/* Header · passt sich an */}
        <AnimatePresence mode="wait">
          {focusCluster ? (
            <motion.div
              key="h-cluster"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setFocusCluster(null)}
                className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.25em] mb-2"
              >
                <ArrowLeft className="h-3 w-3" /> Atlas-Übersicht
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="h-overview"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-accent mb-1">Wissens-Universum</p>
              <h1 className="gravur text-2xl md:text-3xl font-medium leading-tight">
                <span className="text-gradient">Meister-Atlas</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Tippe einen Cluster — er entfaltet alle Themen.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini-Stats (nur in Overview) */}
        {!focusCluster && (
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            <MiniStat label="Themen" value={overviewStats.total} color="text-muted-foreground" />
            <MiniStat label="Begonnen" value={overviewStats.begonnen} color="text-primary" />
            <MiniStat label="Schwach" value={overviewStats.schwach} color="text-destructive" />
            <MiniStat label="Meisterlich" value={overviewStats.meisterlich} color="text-accent" />
          </div>
        )}

        {/* Filter-Chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
          <FilterChip label="Alles" active={filter === "alle"}        onClick={() => setFilter("alle")}        color="160" />
          <FilterChip label="Offen" active={filter === "offen"}        onClick={() => setFilter("offen")}       color="200" />
          <FilterChip label="Schwach" active={filter === "schwach"}    onClick={() => setFilter("schwach")}     color="25" />
          <FilterChip label="Meisterlich" active={filter === "meisterlich"} onClick={() => setFilter("meisterlich")} color="75" />
        </div>

        {/* Canvas · wechselt zwischen Galaxie und Mindmap */}
        <Card className="border-border/40 bg-gradient-to-br from-card/50 to-background overflow-hidden relative min-h-[500px]">
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              {focusCluster ? (
                <motion.div
                  key={`cluster-${focusCluster}`}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ClusterMindmap
                    cluster={focusCluster}
                    themen={themenByCluster[focusCluster] ?? []}
                    themaMastery={themaMastery}
                    matchesFilter={matchesFilter}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="galaxy"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <GalaxyView
                    themenByCluster={themenByCluster}
                    themaMastery={themaMastery}
                    matchesFilter={matchesFilter}
                    onClusterTap={setFocusCluster}
                    daysToExam={daysToExam}
                    levelIcon={<LevelEmblem level={level.level} active achieved size={32} />}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Legende · nur in Overview */}
        {!focusCluster && (
          <div className="rounded-xl border border-border/40 bg-card/30 p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Mastery-Legende</p>
            <div className="flex items-center gap-2 text-[11px] flex-wrap">
              <LegendDot color="bg-muted/60" label="Unbekannt" />
              <span className="text-muted-foreground/40">·</span>
              <LegendDot color="bg-destructive/80" label="Schwach < 50" />
              <span className="text-muted-foreground/40">·</span>
              <LegendDot color="bg-primary" label="In Arbeit" />
              <span className="text-muted-foreground/40">·</span>
              <LegendDot color="bg-accent" label="Meisterlich ≥ 90" />
            </div>
          </div>
        )}

        <ClawbuisPortal />
      </main>
    </div>
  );
}

// ─── GALAXY VIEW · Ebene 1 ─────────────────────────────────────

function GalaxyView({
  themenByCluster, themaMastery, matchesFilter, onClusterTap, daysToExam, levelIcon,
}: {
  themenByCluster: Record<Cluster, ThemaFrontmatter[]>;
  themaMastery: (t: ThemaFrontmatter) => number;
  matchesFilter: (t: ThemaFrontmatter) => boolean;
  onClusterTap: (c: Cluster) => void;
  daysToExam: number | null;
  levelIcon: React.ReactNode;
}) {
  const SIZE = 420;
  const CENTER = SIZE / 2;
  const CLUSTER_R = 140;
  const ROT_OFFSET = -Math.PI / 2;

  return (
    <div className="relative w-full aspect-square max-w-xl mx-auto">
      {/* Deep-Space BG */}
      <div aria-hidden className="absolute inset-0 rounded-lg overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(circle at 50% 50%, oklch(0.13 0.03 165) 0%, oklch(0.08 0.015 260) 80%)",
        }} />
        {Array.from({ length: 35 }).map((_, i) => {
          const x = (i * 37) % 100;
          const y = (i * 71) % 100;
          const delay = (i % 5) * 0.6;
          return (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full bg-accent"
              style={{ left: `${x}%`, top: `${y}%` }}
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 3, delay, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}
      </div>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="relative w-full h-full">
        <defs>
          <radialGradient id="centerCore">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#c29b62" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c29b62" stopOpacity="0" />
          </radialGradient>
          {CLUSTERS.map((c) => (
            <radialGradient key={`clGrad-${c.id}`} id={`clGrad-${c.id}`}>
              <stop offset="0%" stopColor={`oklch(0.75 0.14 ${c.hue})`} stopOpacity="0.95" />
              <stop offset="100%" stopColor={`oklch(0.55 0.12 ${c.hue})`} stopOpacity="0.3" />
            </radialGradient>
          ))}
        </defs>

        {/* Pulse-Rings um Zentrum */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`pulse-${i}`}
            cx={CENTER} cy={CENTER} r="38"
            fill="none" stroke="oklch(0.72 0.11 75)" strokeWidth="1"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 0.4, 0], scale: [1, 3.2, 3.2] }}
            transition={{ duration: 3.5, delay: i * 1.2, repeat: Infinity, ease: "easeOut" }}
          />
        ))}

        {/* Zentrum-Glow */}
        <circle cx={CENTER} cy={CENTER} r="60" fill="url(#centerCore)" />

        {/* Verbindungen */}
        {CLUSTERS.map((c, i) => {
          const angle = (Math.PI * 2 * i) / 6 + ROT_OFFSET;
          const cx = CENTER + Math.cos(angle) * CLUSTER_R;
          const cy = CENTER + Math.sin(angle) * CLUSTER_R;
          return (
            <motion.line
              key={`line-${c.id}`}
              x1={CENTER} y1={CENTER} x2={cx} y2={cy}
              stroke={`oklch(0.7 0.13 ${c.hue})`}
              strokeWidth="1"
              strokeDasharray="3 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
            />
          );
        })}

        {/* 6 Cluster-Knoten */}
        {CLUSTERS.map((c, i) => {
          const themen = themenByCluster[c.id] ?? [];
          const angle = (Math.PI * 2 * i) / 6 + ROT_OFFSET;
          const cx = CENTER + Math.cos(angle) * CLUSTER_R;
          const cy = CENTER + Math.sin(angle) * CLUSTER_R;
          const clusterSize = 32 + themen.length * 2;
          const avgMastery = themen.length
            ? Math.round(themen.map(themaMastery).reduce((s, v) => s + v, 0) / themen.length)
            : 0;
          const visibleCount = themen.filter(matchesFilter).length;

          return (
            <motion.g
              key={c.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: `${cx}px ${cy}px`, cursor: "pointer" }}
              onClick={() => onClusterTap(c.id)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
            >
              {/* Mastery-Ring */}
              {avgMastery > 0 && (
                <circle
                  cx={cx} cy={cy} r={clusterSize + 4}
                  fill="none"
                  stroke={`oklch(0.82 0.15 ${c.hue})`}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${(avgMastery / 100) * (2 * Math.PI * (clusterSize + 4))} ${2 * Math.PI * (clusterSize + 4)}`}
                  transform={`rotate(-90 ${cx} ${cy})`}
                  opacity="0.85"
                />
              )}

              {/* Glow-Kreis */}
              <circle
                cx={cx} cy={cy} r={clusterSize}
                fill={`url(#clGrad-${c.id})`}
                stroke={`oklch(0.72 0.14 ${c.hue})`}
                strokeWidth="2"
                style={{ filter: `drop-shadow(0 0 14px oklch(0.7 0.13 ${c.hue} / 0.55))` }}
              >
                <title>{c.label}</title>
              </circle>

              {/* Themen-Anzahl groß */}
              <text
                x={cx} y={cy + 5}
                textAnchor="middle"
                fontSize="18"
                fontWeight="700"
                fill="oklch(0.95 0.05 75)"
                className="gravur"
                style={{ pointerEvents: "none" }}
              >
                {themen.length}
              </text>

              {/* Label */}
              <text
                x={cx} y={cy + clusterSize + 18}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={`oklch(0.88 0.12 ${c.hue})`}
                letterSpacing="0.06em"
                style={{ textTransform: "uppercase", pointerEvents: "none" }}
              >
                {c.short}
              </text>
              <text
                x={cx} y={cy + clusterSize + 32}
                textAnchor="middle"
                fontSize="10"
                fill="rgba(255,255,255,0.55)"
                fontFamily="monospace"
                style={{ pointerEvents: "none" }}
              >
                {avgMastery}% · {visibleCount}/{themen.length}
              </text>
            </motion.g>
          );
        })}

        {/* Zentrum · Countdown */}
        <g style={{ pointerEvents: "none" }}>
          <circle cx={CENTER} cy={CENTER} r="36" fill="oklch(0.15 0.02 165)" stroke="oklch(0.72 0.11 75)" strokeWidth="1.5" />
          {daysToExam !== null && (
            <>
              <text x={CENTER} y={CENTER - 4} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--accent)" className="gravur">
                {daysToExam}
              </text>
              <text x={CENTER} y={CENTER + 10} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.6)" letterSpacing="2" style={{ textTransform: "uppercase" }}>
                Tage
              </text>
              <text x={CENTER} y={CENTER + 21} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" letterSpacing="1.5" style={{ textTransform: "uppercase" }}>
                Prüfung
              </text>
            </>
          )}
        </g>
      </svg>

      <div className="absolute top-3 right-3 opacity-80">{levelIcon}</div>
    </div>
  );
}

// ─── CLUSTER MINDMAP · Ebene 2 ──────────────────────────────────

function ClusterMindmap({
  cluster, themen, themaMastery, matchesFilter,
}: {
  cluster: Cluster;
  themen: ThemaFrontmatter[];
  themaMastery: (t: ThemaFrontmatter) => number;
  matchesFilter: (t: ThemaFrontmatter) => boolean;
}) {
  const c = CLUSTERS.find((x) => x.id === cluster)!;
  const sorted = [...themen].sort((a, b) => a.reihenfolge - b.reihenfolge);
  const avgMastery = sorted.length
    ? Math.round(sorted.map(themaMastery).reduce((s, v) => s + v, 0) / sorted.length)
    : 0;
  const totalFragen = sorted.reduce((s, t) => s + (t.fragen?.length ?? 0), 0);

  return (
    <div className="relative p-4 md:p-8">
      {/* Hub */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md mx-auto mb-8 md:mb-10"
      >
        <div className="rounded-2xl p-5 md:p-6 text-center relative overflow-hidden"
             style={{
               background: `radial-gradient(circle at 50% 0%, oklch(0.72 0.14 ${c.hue} / 0.25) 0%, oklch(0.12 0.02 260) 70%)`,
               border: `1.5px solid oklch(0.6 0.12 ${c.hue} / 0.5)`,
               boxShadow: `0 0 40px oklch(0.6 0.12 ${c.hue} / 0.25)`,
             }}>
          <p className="text-[10px] uppercase tracking-[0.3em] mb-2"
             style={{ color: `oklch(0.82 0.12 ${c.hue})` }}>
            Cluster
          </p>
          <h2 className="gravur text-2xl md:text-3xl font-medium leading-tight mb-1">{c.label}</h2>
          <p className="text-xs text-muted-foreground mb-4">{sorted.length} Themen · {totalFragen} Fragen</p>

          {/* Mastery-Ring visuell */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <MasteryCircle mastery={avgMastery} hue={c.hue} size={70} />
          </div>
        </div>
      </motion.div>

      {/* Themen-Karten · Mindmap-Layout · responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-3xl mx-auto">
        {sorted.map((t, i) => {
          const m = themaMastery(t);
          const inFilter = matchesFilter(t);
          const fragenCount = t.fragen?.length ?? 0;

          return (
            <motion.div
              key={t.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: inFilter ? 1 : 0.4, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <ThemaMindmapCard thema={t} mastery={m} fragenCount={fragenCount} hue={c.hue} clusterLabel={c.short} />
            </motion.div>
          );
        })}
      </div>

      {/* Footer-Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 + sorted.length * 0.07 }}
        className="max-w-md mx-auto mt-6 grid grid-cols-2 gap-2"
      >
        <Link href={`/pruefung/session?mode=cluster&cluster=${cluster}&count=${Math.min(15, totalFragen)}`}>
          <button className="w-full h-11 rounded-xl border border-accent/40 bg-accent/10 hover:bg-accent/20 hover:border-accent/70 transition-all flex items-center justify-center gap-2 text-sm font-medium">
            <Zap className="h-4 w-4 text-accent" />
            Cluster üben
          </button>
        </Link>
        <Link href={`/lernen?cluster=${cluster}`}>
          <button className="w-full h-11 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-medium">
            <BookOpen className="h-4 w-4" />
            Alle Lektionen
          </button>
        </Link>
      </motion.div>
    </div>
  );
}

// ─── Thema-Karte (Mindmap-Node) ─────────────────────────────────

function ThemaMindmapCard({
  thema, mastery, fragenCount, hue, clusterLabel,
}: {
  thema: ThemaFrontmatter;
  mastery: number;
  fragenCount: number;
  hue: number;
  clusterLabel: string;
}) {
  return (
    <Link href={`/lernen/${thema.slug}`}>
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="group relative rounded-xl overflow-hidden cursor-pointer h-full"
        style={{
          background: `linear-gradient(135deg, oklch(0.12 0.02 260 / 0.8), oklch(0.08 0.015 260 / 0.4))`,
          border: `1px solid oklch(0.5 0.1 ${hue} / 0.4)`,
        }}
      >
        {/* Seitenstreifen (cluster-hue) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: `linear-gradient(to bottom, oklch(0.75 0.14 ${hue}), oklch(0.55 0.12 ${hue}))` }}
        />

        {/* Content */}
        <div className="p-3.5 md:p-4 pl-4 md:pl-5 flex items-start gap-3">
          {/* Mastery-Kreis */}
          <MasteryCircle mastery={mastery} hue={hue} size={48} compact />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] uppercase tracking-[0.2em] font-mono"
                    style={{ color: `oklch(0.78 0.13 ${hue})` }}>
                {String(thema.reihenfolge).padStart(2, "0")}
              </span>
              {mastery >= 90 && <CheckCircle2 className="h-3 w-3 text-accent" />}
            </div>
            <h3 className="gravur text-sm md:text-base font-medium leading-tight mb-1.5 group-hover:text-primary transition-colors">
              {thema.titel}
            </h3>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {thema.dauer_min} min</span>
              <span className="flex items-center gap-0.5"><Target className="h-2.5 w-2.5" /> {thema.schwierigkeit}/5</span>
              {fragenCount > 0 && <span className="flex items-center gap-0.5"><Zap className="h-2.5 w-2.5" /> {fragenCount}</span>}
            </div>
          </div>

          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Mastery-Kreis · SVG progress ──────────────────────────────

function MasteryCircle({ mastery, hue, size = 50, compact = false }: { mastery: number; hue: number; size?: number; compact?: boolean }) {
  const stroke = compact ? 3 : 5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - mastery / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.3 0.02 260)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={`oklch(0.78 0.14 ${hue})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: mastery >= 90 ? `drop-shadow(0 0 4px oklch(0.78 0.14 ${hue}))` : "none" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`gravur font-semibold ${compact ? "text-xs" : "text-base"}`}
              style={{ color: mastery > 0 ? `oklch(0.88 0.12 ${hue})` : "var(--muted-foreground)" }}>
          {mastery}%
        </span>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function MiniStat({ label, value, color = "text-foreground" }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/40 p-2.5 text-center">
      <p className={`gravur text-base font-semibold ${color}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

function FilterChip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap"
      style={{
        borderColor: active ? `oklch(0.7 0.14 ${color})` : "oklch(1 0 0 / 0.1)",
        background: active ? `oklch(0.6 0.12 ${color} / 0.15)` : "transparent",
        color: active ? `oklch(0.85 0.14 ${color})` : "var(--muted-foreground)",
      }}
    >
      {label}
    </button>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 rounded-full ${color}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
