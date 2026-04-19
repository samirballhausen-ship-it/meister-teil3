"use client";

/**
 * Lern-Visuals · kompakte Mini-Erklärbilder für MDX-Lektionen
 * Nutzung in MDX über Custom-Components (ReactMarkdown components={...}).
 * Alle: mobile-first, animated, self-contained.
 */

import { motion, useInView } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { Check, X, ArrowRight, TrendingUp, TrendingDown, Info, ChevronRight } from "lucide-react";

// ─── Fakt · große Zahl prominent ──────────────────────────────────

export function Fakt({
  zahl, einheit, label, color = "accent",
}: {
  zahl: string; einheit?: string; label: string; color?: "accent" | "primary" | "destructive" | "success";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const colorCls = {
    accent:      "from-accent/20 via-accent/5 border-accent/40 text-accent",
    primary:     "from-primary/20 via-primary/5 border-primary/40 text-primary",
    destructive: "from-destructive/20 via-destructive/5 border-destructive/40 text-destructive",
    success:     "from-success/20 via-success/5 border-success/40 text-success",
  }[color];

  return (
    <div ref={ref} className={`my-6 rounded-2xl border bg-gradient-to-br to-transparent p-5 md:p-6 text-center ${colorCls}`}>
      <motion.p
        initial={{ scale: 0.7, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ type: "spring", stiffness: 130, delay: 0.1 }}
        className="gravur text-4xl md:text-6xl font-semibold leading-none"
      >
        {zahl}
        {einheit && <span className="text-xl md:text-2xl ml-2 font-normal opacity-70">{einheit}</span>}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.4 }}
        className="mt-3 text-xs md:text-sm text-muted-foreground uppercase tracking-[0.2em]"
      >
        {label}
      </motion.p>
    </div>
  );
}

// ─── Formel · stilisierte Gleichung mit Legende ───────────────────

export function Formel({
  label,
  formel,
  ergebnis,
  legende,
}: {
  label: string;
  formel: string;
  ergebnis?: string;
  legende?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div ref={ref} className="my-6 rounded-2xl border border-success/30 bg-success/5 overflow-hidden">
      <div className="px-4 py-2 bg-success/10 border-b border-success/20 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-success">Formel</span>
        <span className="text-xs text-success/80">{label}</span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="p-5 text-center"
      >
        <p className="font-mono text-lg md:text-xl text-foreground">
          {formel}
        </p>
        {ergebnis && (
          <p className="mt-3 font-mono text-2xl md:text-3xl gravur text-success">= {ergebnis}</p>
        )}
        {legende && <p className="mt-3 text-[11px] text-muted-foreground italic">{legende}</p>}
      </motion.div>
    </div>
  );
}

// ─── Vergleich · 2-Spalten ────────────────────────────────────────

export function Vergleich({
  linksLabel, rechtsLabel, links, rechts,
}: {
  linksLabel: string; rechtsLabel: string;
  links: ReactNode; rechts: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div ref={ref} className="my-6 grid grid-cols-2 gap-3 md:gap-4">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="rounded-xl border border-primary/30 bg-primary/5 p-4"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-primary mb-2">{linksLabel}</p>
        <div className="text-sm text-foreground/95">{links}</div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="rounded-xl border border-accent/30 bg-accent/5 p-4"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-accent mb-2">{rechtsLabel}</p>
        <div className="text-sm text-foreground/95">{rechts}</div>
      </motion.div>
    </div>
  );
}

// ─── Merkkarte · Flip-Card ────────────────────────────────────────

export function Merkkarte({
  vorne, hinten,
}: {
  vorne: ReactNode;
  hinten: ReactNode;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="my-6 relative h-40 md:h-44 cursor-pointer select-none"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/15 to-accent/5 flex flex-col items-center justify-center px-5 text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-sm md:text-base text-foreground font-medium">{vorne}</div>
          <p className="mt-3 text-[9px] uppercase tracking-[0.3em] text-accent/60">Tippen für Antwort</p>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 flex flex-col items-center justify-center px-5 text-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-sm md:text-base text-foreground">{hinten}</div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Ablauf · Arrow-Chain ─────────────────────────────────────────

export function Ablauf({ schritte }: { schritte: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div ref={ref} className="my-6 flex flex-col md:flex-row items-stretch gap-2 md:gap-0">
      {schritte.map((s, i) => (
        <div key={i} className="flex-1 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="flex-1 relative rounded-xl border border-primary/30 bg-primary/5 p-3 text-center"
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {i + 1}
            </div>
            <p className="text-xs md:text-sm font-medium pt-1">{s}</p>
          </motion.div>
          {i < schritte.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-center justify-center"
            >
              <ArrowRight className="hidden md:block h-4 w-4 text-primary mx-1.5" />
              <ChevronRight className="md:hidden h-4 w-4 text-primary rotate-90 my-1" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── StatBar · horizontaler Fortschritt mit Label ────────────────

export function StatBar({
  label, wert, max, einheit, color = "primary",
}: {
  label: string; wert: number; max: number; einheit?: string;
  color?: "primary" | "accent" | "success" | "destructive";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const pct = Math.min(100, (wert / max) * 100);
  const colorCls = {
    primary:     "bg-primary",
    accent:      "bg-accent",
    success:     "bg-success",
    destructive: "bg-destructive",
  }[color];
  return (
    <div ref={ref} className="my-4">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs text-foreground font-medium">{label}</span>
        <span className="font-mono text-sm">
          {wert.toLocaleString("de-DE")}
          {einheit && <span className="text-muted-foreground ml-1">{einheit}</span>}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorCls}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ type: "spring", stiffness: 110, damping: 18 }}
        />
      </div>
    </div>
  );
}

// ─── BilanzT · T-Konto Visualisierung ─────────────────────────────

export function BilanzT({
  links, rechts, gesamtLinks, gesamtRechts,
}: {
  links: { label: string; wert: number }[];
  rechts: { label: string; wert: number }[];
  gesamtLinks?: number;
  gesamtRechts?: number;
}) {
  return (
    <div className="my-6 rounded-2xl border border-border/50 bg-card/40 overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-border/50">
        <div>
          <div className="px-3 py-2 bg-primary/10 border-b border-primary/20">
            <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold text-center">Soll · Aktiva</p>
          </div>
          <div className="p-4 space-y-1.5 text-sm font-mono">
            {links.map((l, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-foreground/90">{l.label}</span>
                <span>{l.wert.toLocaleString("de-DE")} €</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="px-3 py-2 bg-accent/10 border-b border-accent/20">
            <p className="text-[10px] uppercase tracking-[0.25em] text-accent font-semibold text-center">Haben · Passiva</p>
          </div>
          <div className="p-4 space-y-1.5 text-sm font-mono">
            {rechts.map((r, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-foreground/90">{r.label}</span>
                <span>{r.wert.toLocaleString("de-DE")} €</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {(gesamtLinks || gesamtRechts) && (
        <div className="grid grid-cols-2 divide-x divide-border/50 bg-muted/30 border-t border-border/50">
          <div className="px-4 py-2 text-sm font-mono font-semibold text-center">
            {gesamtLinks?.toLocaleString("de-DE")} €
          </div>
          <div className="px-4 py-2 text-sm font-mono font-semibold text-center">
            {gesamtRechts?.toLocaleString("de-DE")} €
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tipp · Info-Callout ──────────────────────────────────────────

export function Tipp({ children, typ = "info" }: { children: ReactNode; typ?: "info" | "warn" | "success" }) {
  const map = {
    info:    { color: "primary",     Icon: Info },
    warn:    { color: "destructive", Icon: X },
    success: { color: "success",     Icon: Check },
  };
  const m = map[typ];
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`my-5 rounded-xl border border-${m.color}/30 bg-${m.color}/5 p-3 md:p-4 flex gap-3`}
    >
      <m.Icon className={`h-4 w-4 text-${m.color} shrink-0 mt-0.5`} />
      <div className="text-xs md:text-sm text-foreground/95">{children}</div>
    </motion.div>
  );
}

// ─── Trend · Pfeil hoch/runter mit Bedeutung ──────────────────────

export function Trend({
  richtung, label, bedeutung,
}: {
  richtung: "hoch" | "runter"; label: string; bedeutung: string;
}) {
  const up = richtung === "hoch";
  const Icon = up ? TrendingUp : TrendingDown;
  const color = up ? "success" : "destructive";
  return (
    <div className={`my-5 rounded-xl border border-${color}/30 bg-${color}/5 p-4 flex items-center gap-4`}>
      <div className={`h-10 w-10 rounded-full bg-${color}/15 flex items-center justify-center shrink-0`}>
        <Icon className={`h-5 w-5 text-${color}`} />
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{bedeutung}</p>
      </div>
    </div>
  );
}
