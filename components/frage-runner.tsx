"use client";

/**
 * FrageRunner · polished
 * MC / Liste / Rechnen / Offen · Keyboard-Shortcuts (1-5) · XP-Burst-Animation
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useProgress } from "@/lib/progress-context";
import type { Frage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClawbuisCredit } from "@/components/clawbuis-badge";
import { Check, X, ChevronRight, Sparkles, Target, PenLine, Plus, Calculator, Clock, Trophy, CheckCircle2, CircleMinus, XCircle, Lightbulb, Brain } from "lucide-react";

interface Props {
  fragen: Frage[];
  mode: string;
  timerSec?: number;
}

interface Result { total: number; correct: number; partial: number; wrong: number; }

export function FrageRunner({ fragen, mode, timerSec }: Props) {
  const { recordAnswer } = useProgress();
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<Result>({ total: 0, correct: 0, partial: 0, wrong: 0 });
  const [done, setDone] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(timerSec ?? null);
  const [xpBurst, setXpBurst] = useState<{ value: number; key: number } | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) { setDone(true); return; }
    const t = setInterval(() => setRemaining((r) => (r === null ? null : r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  if (fragen.length === 0) {
    return <div className="min-h-dvh flex items-center justify-center text-muted-foreground">Keine Fragen im Pool.</div>;
  }

  const cur = fragen[idx];
  const last = idx === fragen.length - 1;

  const handle = (correct: boolean, respSec: number, partial?: boolean) => {
    recordAnswer(cur.id, correct, respSec, partial, hintShown);

    // XP-Burst (mit Hinweis-Penalty: 60%)
    let xpGained = correct && !partial ? 12 : partial ? 6 : 2;
    if (hintShown) xpGained = Math.max(1, Math.round(xpGained * 0.6));
    setXpBurst({ value: xpGained, key: Date.now() });
    setTimeout(() => setXpBurst(null), 1200);

    const next: Result = {
      total: result.total + 1,
      correct: result.correct + (correct && !partial ? 1 : 0),
      partial: result.partial + (partial ? 1 : 0),
      wrong: result.wrong + (!correct ? 1 : 0),
    };
    setResult(next);

    setTimeout(() => {
      if (last) setDone(true);
      else { setIdx(idx + 1); setHintShown(false); }
    }, 400);
  };

  if (done) {
    return (
      <ResultScreen
        result={result}
        mode={mode}
        duration={Math.round((Date.now() - startRef.current) / 1000)}
      />
    );
  }

  const pct = ((idx + 1) / fragen.length) * 100;

  return (
    <div className="min-h-dvh flex flex-col bg-background relative">
      {/* XP-Burst */}
      <AnimatePresence>
        {xpBurst && (
          <motion.div
            key={xpBurst.key}
            initial={{ opacity: 0, y: 20, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], y: [20, -20, -40, -80], scale: [0.7, 1.1, 1, 0.9] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, times: [0, 0.2, 0.7, 1] }}
            className="fixed top-1/3 right-4 md:right-10 z-50 pointer-events-none"
          >
            <div className="px-3 py-1.5 rounded-full bg-xp/20 border border-xp/50 backdrop-blur-md glow-xp flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-xp" />
              <span className="gravur text-sm text-xp font-semibold">+{xpBurst.value}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/85 border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 md:px-5 py-2.5 flex items-center gap-3">
          <Link href="/pruefung" className="text-xs text-muted-foreground hover:text-primary uppercase tracking-[0.2em]">Abbrechen</Link>
          <span className="text-[11px] text-muted-foreground">Frage {idx + 1}/{fragen.length}</span>
          <div className="flex-1 h-1 rounded-full bg-muted/40 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary to-accent" animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 120 }} />
          </div>
          <span className="text-[11px] font-mono text-success">{result.correct}✓</span>
          {remaining !== null && (
            <span className={`text-[11px] font-mono flex items-center gap-1 ${remaining < 300 ? "text-destructive animate-pulse" : "text-accent"}`}>
              <Clock className="h-3 w-3" /> {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
            </span>
          )}
        </div>
      </header>

      {/* Frage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cur.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3 }}
          className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-5 py-6"
        >
          <TypIcon typ={cur.typ} />
          {cur.kontext && (
            <div className="rounded-lg bg-muted/30 border border-border/40 p-3 text-sm italic text-muted-foreground mb-4">
              {cur.kontext}
            </div>
          )}
          <h2 className="gravur text-xl md:text-2xl leading-tight mb-4">{cur.prompt}</h2>

          {/* Hinweis-Feld · nur bei vorhandenem Hinweis */}
          {cur.hinweis && (
            <HinweisPanel hinweis={cur.hinweis} shown={hintShown} onReveal={() => setHintShown(true)} />
          )}

          {(cur.typ === "mc-4" || cur.typ === "mc-5" || cur.typ === "wahr-falsch") && <MCUI frage={cur} onAnswer={handle} />}
          {cur.typ === "liste" && <ListeUI frage={cur} onAnswer={handle} />}
          {cur.typ === "rechnen" && <RechnenUI frage={cur} onAnswer={handle} />}
          {cur.typ === "offen" && <OffenUI frage={cur} onAnswer={handle} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TypIcon({ typ }: { typ: string }) {
  const M: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }>; color: string }> = {
    "mc-4":       { label: "Multiple Choice",     Icon: Target,     color: "text-primary" },
    "mc-5":       { label: "Multiple Choice",     Icon: Target,     color: "text-primary" },
    "offen":      { label: "Freitext",            Icon: PenLine,    color: "text-accent" },
    "liste":      { label: "Liste · mindestens",  Icon: Plus,       color: "text-accent" },
    "rechnen":    { label: "Rechenaufgabe",       Icon: Calculator, color: "text-success" },
    "wahr-falsch":{ label: "Wahr / Falsch",       Icon: Target,     color: "text-primary" },
  };
  const m = M[typ] ?? M.offen;
  return (
    <div className="inline-flex items-center gap-1.5 mb-3">
      <m.Icon className={`h-3.5 w-3.5 ${m.color}`} />
      <span className={`text-[10px] uppercase tracking-[0.25em] ${m.color}`}>{m.label}</span>
    </div>
  );
}

// ─── MC · mit Keyboard-Shortcuts ─────────────────────────────

function MCUI({ frage, onAnswer }: { frage: Frage; onAnswer: (c: boolean, t: number, p?: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [t0] = useState(Date.now());

  const shuffled = useMemo(() => {
    if (!frage.antworten) return [];
    const arr = frage.antworten.map((a, i) => ({ ...a, origIdx: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frage.id]);

  const pick = (i: number) => {
    if (revealed) return;
    setPicked(i);
    setRevealed(true);
  };

  // Keyboard 1-5
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (revealed) {
        if (e.key === "Enter" || e.key === " ") onAnswer(shuffled[picked!]?.korrekt ?? false, (Date.now() - t0) / 1000);
        return;
      }
      const n = parseInt(e.key);
      if (!isNaN(n) && n >= 1 && n <= shuffled.length) pick(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, picked, shuffled]);

  if (!frage.antworten) return null;
  const isCorrect = picked !== null && shuffled[picked]?.korrekt;

  return (
    <div>
      <div className="space-y-2.5">
        {shuffled.map((a, i) => {
          const p = picked === i;
          const r = a.korrekt;
          return (
            <motion.button
              key={i}
              whileTap={!revealed ? { scale: 0.98 } : {}}
              onClick={() => pick(i)}
              disabled={revealed}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all"
              style={{
                borderColor: !revealed
                  ? "oklch(1 0 0 / 0.1)"
                  : r        ? "var(--success)"
                  : p        ? "var(--destructive)"
                             : "oklch(1 0 0 / 0.05)",
                background: !revealed
                  ? "oklch(1 0 0 / 0.02)"
                  : r ? "oklch(0.7 0.18 145 / 0.12)"
                  : p ? "oklch(0.55 0.18 25 / 0.12)"
                  : "transparent",
                opacity: revealed && !r && !p ? 0.4 : 1,
              }}
            >
              <span
                className="shrink-0 h-7 w-7 rounded-full border flex items-center justify-center text-xs font-mono"
                style={{
                  borderColor: !revealed ? "var(--border)" : r ? "var(--success)" : p ? "var(--destructive)" : "var(--border)",
                  background:  !revealed ? "transparent"   : r ? "var(--success)" : p ? "var(--destructive)" : "transparent",
                  color:       !revealed ? "var(--muted-foreground)" : (r || p) ? "var(--background)" : "var(--muted-foreground)",
                }}
              >
                {revealed && r ? <Check className="h-4 w-4" /> : revealed && p ? <X className="h-4 w-4" /> : String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-sm leading-relaxed">{a.text}</span>
              <span className="hidden md:inline-block text-[10px] text-muted-foreground/50 font-mono mt-1 shrink-0">[{i + 1}]</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-5 rounded-xl border p-4"
            style={{
              borderColor: isCorrect ? "oklch(0.7 0.18 145 / 0.4)" : "oklch(0.55 0.18 25 / 0.4)",
              background:  isCorrect ? "oklch(0.7 0.18 145 / 0.08)" : "oklch(0.55 0.18 25 / 0.06)",
            }}
          >
            <p className={`text-[10px] uppercase tracking-[0.3em] mb-2 font-medium ${isCorrect ? "text-success" : "text-destructive"}`}>
              {isCorrect ? "Richtig" : "Nochmal ansehen"}
            </p>
            {shuffled[picked!]?.erklaerung && <p className="text-sm text-foreground/95 mb-2">{shuffled[picked!].erklaerung}</p>}
            {frage.musterantwort && <p className="text-xs text-muted-foreground italic leading-relaxed">{frage.musterantwort}</p>}
            {frage.eselsbruecke && <LernhilfeCard text={frage.eselsbruecke} />}
          </motion.div>
        )}
      </AnimatePresence>

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex justify-end">
          <Button onClick={() => onAnswer(isCorrect, (Date.now() - t0) / 1000)} size="lg" className="rounded-xl">
            Weiter <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Liste ───────────────────────────────────────────────────────

function ListeUI({ frage, onAnswer }: { frage: Frage; onAnswer: (c: boolean, t: number, p?: boolean) => void }) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [t0] = useState(Date.now());

  const min = frage.liste?.mindestanzahl ?? 5;
  const muster = frage.liste?.muster_items ?? [];
  const items = input.split("\n").map((l) => l.trim()).filter(Boolean);

  const matches = muster.map((m) => {
    const normalize = (s: string) => s.toLowerCase()
      .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss")
      .replace(/[.,;:!?()/]/g, " ").replace(/\s+/g, " ").trim();
    const keys = normalize(m).split(" ").filter((w) => w.length > 2);
    return items.some((u) => {
      const un = normalize(u);
      return keys.some((k) => un.includes(k) || k.includes(un));
    });
  });
  const hits = matches.filter(Boolean).length;

  return (
    <div>
      {!submitted ? (
        <>
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Deine Nennungen: <strong className="text-foreground font-mono">{items.length}</strong></span>
            <span>Ziel: <strong className="text-accent">mindestens {min}</strong></span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden mb-3">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              animate={{ width: `${Math.min(100, (items.length / min) * 100)}%` }}
              transition={{ type: "spring", stiffness: 150 }}
            />
          </div>
          <textarea
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={Math.max(7, items.length + 2)}
            placeholder={`Eine Nennung pro Zeile — mindestens ${min} …`}
            className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border text-sm font-mono leading-relaxed focus:outline-none focus:border-primary transition-colors"
          />
          <div className="mt-5 flex justify-end">
            <Button onClick={() => setSubmitted(true)} disabled={items.length === 0} size="lg" className="rounded-xl">
              Prüfen
            </Button>
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-5 text-center">
            <p className="gravur text-5xl font-semibold text-accent">{hits}<span className="text-muted-foreground text-2xl">/{min}</span></p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-2">erwischt</p>
          </div>

          <div className="rounded-xl border border-border/50 p-4">
            <p className="text-xs font-medium mb-3 flex items-center gap-2">
              <Target className="h-3 w-3 text-primary" /> Muster-Antwort
            </p>
            <ul className="space-y-1.5">
              {muster.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  {matches[i] ? <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" /> : <X className="h-3.5 w-3.5 text-destructive/70 shrink-0 mt-0.5" />}
                  <span className={matches[i] ? "text-foreground" : "text-muted-foreground"}>{m}</span>
                </li>
              ))}
            </ul>
            {frage.eselsbruecke && (
              <p className="mt-4 pt-3 border-t border-border/40 text-xs text-accent flex items-start gap-1.5">
                <Sparkles className="h-3 w-3 mt-0.5 shrink-0" /> {frage.eselsbruecke}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <RatingButton onClick={() => onAnswer(true, (Date.now() - t0) / 1000, false)}  icon={CheckCircle2} color="success"     label="Sicher" />
            <RatingButton onClick={() => onAnswer(true, (Date.now() - t0) / 1000, true)}   icon={CircleMinus}  color="accent"      label="Teilweise" />
            <RatingButton onClick={() => onAnswer(false, (Date.now() - t0) / 1000, false)} icon={XCircle}      color="destructive" label="Nochmal" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Rechnen ─────────────────────────────────────────────────────

function RechnenUI({ frage, onAnswer }: { frage: Frage; onAnswer: (c: boolean, t: number, p?: boolean) => void }) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [t0] = useState(Date.now());

  if (!frage.rechnen) return null;
  const { loesung_wert, loesung_toleranz, eingabe_felder, formel, zwischenschritte } = frage.rechnen;
  const userNum = Number(value.replace(",", "."));
  const isClose = !isNaN(userNum) && Math.abs(userNum - loesung_wert) <= loesung_toleranz;

  return (
    <div>
      <Card className="bg-success/5 border-success/20 mb-5">
        <CardContent className="p-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-success mb-1">Formel</p>
          <p className="font-mono text-sm">{formel}</p>
        </CardContent>
      </Card>

      {!submitted && (
        <div className="space-y-3">
          {eingabe_felder.map((f, i) => (
            <div key={i}>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">{f.label}</label>
              <div className="relative">
                <input
                  autoFocus={i === 0}
                  type="text"
                  inputMode="decimal"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="…"
                  className="w-full px-4 py-3 pr-14 rounded-xl bg-card/50 border border-border font-mono text-xl focus:outline-none focus:border-success transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{f.einheit}</span>
              </div>
            </div>
          ))}
          <Button onClick={() => setSubmitted(true)} disabled={!value} size="lg" className="w-full rounded-xl">Prüfen</Button>
        </div>
      )}

      {submitted && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div
            className="rounded-2xl border p-5 text-center"
            style={{
              borderColor: isClose ? "oklch(0.7 0.18 145 / 0.4)" : "oklch(0.55 0.18 25 / 0.4)",
              background:  isClose ? "oklch(0.7 0.18 145 / 0.08)" : "oklch(0.55 0.18 25 / 0.06)",
            }}
          >
            <p className={`text-[10px] uppercase tracking-[0.3em] mb-2 font-medium ${isClose ? "text-success" : "text-destructive"}`}>
              {isClose ? "Richtig" : "Daneben"}
            </p>
            <div className="space-y-1 font-mono">
              <p><span className="text-muted-foreground">Dein: </span><strong>{value} {eingabe_felder[0]?.einheit}</strong></p>
              <p><span className="text-muted-foreground">Lösung: </span><strong className="text-accent">{loesung_wert.toLocaleString("de-DE")} {eingabe_felder[0]?.einheit}</strong></p>
            </div>
          </div>

          {zwischenschritte && zwischenschritte.length > 0 && (
            <Button variant="outline" onClick={() => setShowSteps(!showSteps)} className="w-full rounded-xl text-xs uppercase tracking-[0.2em]">
              {showSteps ? "Schritte verbergen" : "Zwischenschritte zeigen"}
            </Button>
          )}
          {showSteps && zwischenschritte && (
            <ol className="space-y-2 pl-5 list-decimal marker:text-primary">
              {zwischenschritte.map((s, i) => <li key={i} className="text-sm text-foreground/90 font-mono">{s}</li>)}
            </ol>
          )}

          <Button onClick={() => onAnswer(isClose, (Date.now() - t0) / 1000)} size="lg" className="w-full rounded-xl">
            Weiter <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Offen ───────────────────────────────────────────────────────

function OffenUI({ frage, onAnswer }: { frage: Frage; onAnswer: (c: boolean, t: number, p?: boolean) => void }) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [t0] = useState(Date.now());

  return (
    <div>
      {!submitted ? (
        <>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="Formuliere deine Antwort in eigenen Worten …"
            className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border text-sm leading-relaxed focus:outline-none focus:border-primary transition-colors"
          />
          <div className="mt-5 flex justify-end">
            <Button onClick={() => setSubmitted(true)} disabled={!text.trim()} size="lg" className="rounded-xl">
              Muster zeigen
            </Button>
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Muster-Antwort</p>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/95">{frage.musterantwort}</p>
              {frage.musterpunkte && frage.musterpunkte.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {frage.musterpunkte.map((p) => (
                    <Badge key={p} variant="outline" className="text-[10px] border-primary/40 text-primary">{p}</Badge>
                  ))}
                </div>
              )}
              {frage.eselsbruecke && (
                <p className="mt-4 pt-3 border-t border-primary/20 text-xs text-accent flex items-start gap-1.5">
                  <Sparkles className="h-3 w-3 mt-0.5 shrink-0" /> {frage.eselsbruecke}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            <RatingButton onClick={() => onAnswer(true, (Date.now() - t0) / 1000, false)}  icon={CheckCircle2} color="success"     label="Sicher" />
            <RatingButton onClick={() => onAnswer(true, (Date.now() - t0) / 1000, true)}   icon={CircleMinus}  color="accent"      label="Teilweise" />
            <RatingButton onClick={() => onAnswer(false, (Date.now() - t0) / 1000, false)} icon={XCircle}      color="destructive" label="Nochmal" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function RatingButton({
  onClick, icon: Icon, color, label,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  color: "success" | "accent" | "destructive";
  label: string;
}) {
  const palette = {
    success:     { text: "text-success",     border: "border-success/40",     bg: "hover:bg-success/10" },
    accent:      { text: "text-accent",      border: "border-accent/40",      bg: "hover:bg-accent/10" },
    destructive: { text: "text-destructive", border: "border-destructive/40", bg: "hover:bg-destructive/10" },
  }[color];
  return (
    <button
      onClick={onClick}
      className={`py-3 rounded-xl border ${palette.border} ${palette.text} ${palette.bg} text-sm font-medium transition-colors inline-flex items-center justify-center gap-1.5`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

// ─── Result-Screen ───────────────────────────────────────────────

function ResultScreen({ result, mode, duration }: { result: Result; mode: string; duration: number }) {
  const pct = Math.round((result.correct / Math.max(result.total, 1)) * 100);
  const titel = pct >= 85 ? "Meisterlich." : pct >= 60 ? "Solide." : pct >= 30 ? "Auf gutem Weg." : "Noch üben.";
  const examMode = mode === "exam";

  return (
    <div className="min-h-dvh flex items-center justify-center px-5 py-16 relative">
      {/* Confetti für gute Ergebnisse */}
      {pct >= 70 && (
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-0 w-2 h-2 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                background: i % 3 === 0 ? "var(--primary)" : i % 3 === 1 ? "var(--accent)" : "var(--success)",
              }}
              initial={{ y: -20, rotate: 0, opacity: 1 }}
              animate={{ y: "100vh", rotate: 360 * 3, opacity: 0 }}
              transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 2, ease: "linear" }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center space-y-6 relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <div className={`mx-auto h-28 w-28 rounded-full flex items-center justify-center glow-primary ${examMode && pct >= 50 ? "animate-pulse-amber" : ""}`}
               style={{ background: `conic-gradient(var(--primary) ${pct}%, oklch(1 0 0 / 0.08) ${pct}%)` }}>
            <div className="h-24 w-24 rounded-full bg-background flex items-center justify-center">
              <span className="gravur text-4xl font-semibold text-gradient">{pct}</span>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-3">Score</p>
        </motion.div>

        <h2 className="gravur text-3xl md:text-4xl font-medium">{titel}</h2>
        <p className="text-sm text-muted-foreground">
          {result.correct} richtig · {result.partial} teilweise · {result.wrong} falsch · {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")} min
        </p>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg border border-success/30 bg-success/5 py-2">
            <p className="text-success font-semibold">{result.correct}</p>
            <p className="text-muted-foreground text-[10px]">richtig</p>
          </div>
          <div className="rounded-lg border border-accent/30 bg-accent/5 py-2">
            <p className="text-accent font-semibold">{result.partial}</p>
            <p className="text-muted-foreground text-[10px]">teilweise</p>
          </div>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 py-2">
            <p className="text-destructive font-semibold">{result.wrong}</p>
            <p className="text-muted-foreground text-[10px]">falsch</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Link href="/pruefung" className="flex-1">
            <Button size="lg" className="w-full rounded-xl"><Trophy className="mr-2 h-4 w-4" />Neue Session</Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" size="lg" className="w-full rounded-xl">Zum Start</Button>
          </Link>
        </div>

        {/* CLAWBUIS Credit */}
        <ClawbuisCredit />
      </motion.div>
    </div>
  );
}

// ─── Hinweis-Panel · öffnet mit XP-Penalty ────────────────────

function HinweisPanel({ hinweis, shown, onReveal }: { hinweis: string; shown: boolean; onReveal: () => void }) {
  return (
    <div className="mb-6">
      <AnimatePresence mode="wait">
        {!shown ? (
          <motion.button
            key="btn"
            onClick={onReveal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full text-left rounded-xl border border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 hover:border-accent/70 transition-all p-3 flex items-center gap-2.5 group"
          >
            <div className="h-7 w-7 rounded-lg bg-accent/15 border border-accent/40 flex items-center justify-center shrink-0">
              <Lightbulb className="h-3.5 w-3.5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-accent font-medium">Hinweis öffnen</p>
              <p className="text-[10px] text-muted-foreground">Weniger XP · keine Antwort, nur ein Denk-Ansatz</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-accent/60 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        ) : (
          <motion.div
            key="hint"
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-accent/50 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-3.5 overflow-hidden"
          >
            <div className="flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-accent/20 border border-accent/50 flex items-center justify-center shrink-0 animate-pulse-glow">
                <Lightbulb className="h-3.5 w-3.5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.25em] text-accent font-medium mb-1">Hinweis · XP −40 %</p>
                <p className="text-sm text-foreground/95 leading-relaxed">{hinweis}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Lernhilfe-Card · kreative Merkhilfe (nach Antwort) ──────

function LernhilfeCard({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="mt-4 relative rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, oklch(0.18 0.12 75 / 0.3), oklch(0.12 0.06 160 / 0.25))",
        border: "1px solid oklch(0.7 0.14 75 / 0.5)",
        boxShadow: "0 0 24px oklch(0.7 0.14 75 / 0.15), inset 0 0 20px oklch(0.7 0.14 160 / 0.08)",
      }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-accent/15 blur-2xl pointer-events-none" />
      <div className="relative p-3.5 flex items-start gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent/50 border border-accent/60 flex items-center justify-center shrink-0"
             style={{ boxShadow: "0 0 12px oklch(0.7 0.14 75 / 0.4)" }}>
          <Brain className="h-4 w-4 text-background" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="gravur text-[10px] uppercase tracking-[0.3em] text-accent font-medium mb-1">Merkhilfe</p>
          <p className="text-sm text-foreground leading-relaxed italic">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}
