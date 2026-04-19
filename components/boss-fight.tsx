"use client";

/**
 * BossFight · Clawbuis-Raid
 * Der Schüler kämpft gegen den CLAWBUIS-Boss.
 * Jede richtige Antwort auf eine Blitz-Frage macht Schaden am Boss.
 * Der Boss attackiert mit Timer-Pressure (HP läuft ab wenn zu langsam).
 * Boss hat 3 Phasen: Schatten → Glüh-Claw → Meisterbrief-Form.
 * Spielerlebnis first · Lern-Fragen sind "Angriffe".
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClawbuisMark } from "@/components/clawbuis-mark";
import { ClawbuisCredit } from "@/components/clawbuis-badge";
import { Button } from "@/components/ui/button";
import { Swords, Heart, Zap, Trophy, RotateCcw, Shield, Skull } from "lucide-react";

// ─── Kampf-Fragen · schnell, klausurnah, gamified ─────────────

interface BattleQ {
  q: string;
  options: string[];
  correct: number;
  damage: number; // schaden an boss bei richtig
}

const QUESTIONS: BattleQ[] = [
  { q: "Mindestkapital GmbH?",                                    options: ["12.500 €", "25.000 €", "50.000 €", "100.000 €"],                correct: 1, damage: 18 },
  { q: "AO-Schwelle doppelte Buchführung?",                       options: ["600k / 60k €", "700k / 70k €", "800k / 80k €", "1M / 100k €"], correct: 2, damage: 22 },
  { q: "Wie viele Körperschaften öffentl. Rechts bei Gründung?",  options: ["5", "6", "7", "8"],                                             correct: 2, damage: 20 },
  { q: "Marktanalyse = ?",                                         options: ["Film", "Foto", "Beides", "Nichts"],                             correct: 1, damage: 15 },
  { q: "USt-Regelsatz (2025)?",                                   options: ["7 %", "16 %", "19 %", "21 %"],                                  correct: 2, damage: 12 },
  { q: "Wer haftet in GmbH unbeschränkt persönlich?",             options: ["Gesellschafter", "Geschäftsführer bei Pflichtverletzung", "Niemand", "Alle"], correct: 1, damage: 25 },
  { q: "Eigenkapital-Rentabilität = ?",                           options: ["Gewinn / EK × 100", "Umsatz / EK", "EK / Umsatz", "EK / Gesamt"], correct: 0, damage: 20 },
  { q: "SWOT: W steht für?",                                       options: ["Wachstum", "Weaknesses", "Wettbewerb", "Wirtschaft"],           correct: 1, damage: 12 },
  { q: "Produktive Std bei 75 % Produktivität (2080 h Brutto)?",  options: ["1.248", "1.560", "1.820", "2.080"],                             correct: 1, damage: 28 },
  { q: "Komplementär in KG haftet…",                              options: ["beschränkt", "mit Einlage", "unbeschränkt persönlich", "gar nicht"], correct: 2, damage: 22 },
  { q: "Zahllast = ?",                                             options: ["USt + Vorsteuer", "USt − Vorsteuer", "Vorsteuer − USt", "Umsatz × 19 %"], correct: 1, damage: 18 },
  { q: "§ 7 HwO regelt?",                                          options: ["Gewerbesteuer", "Meister-Pflicht im Handwerk", "Umsatzsteuer", "Einkommen"], correct: 1, damage: 15 },
];

const PHASES = [
  { name: "Schatten-Claw",   hpMax: 150, theme: "oklch(0.35 0.05 165)", answerTime: 12 },
  { name: "Glüh-Claw",       hpMax: 220, theme: "oklch(0.55 0.15 30)",  answerTime: 10 },
  { name: "Meister-Claw",    hpMax: 300, theme: "oklch(0.65 0.14 75)",  answerTime: 8  },
];

const HS_KEY = "meister3-highscores";

export function BossFight({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState(0);
  const [bossHp, setBossHp] = useState(PHASES[0].hpMax);
  const [playerHp, setPlayerHp] = useState(100);
  const [qIdx, setQIdx] = useState(() => Math.floor(Math.random() * QUESTIONS.length));
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PHASES[0].answerTime);
  const [gameState, setGameState] = useState<"intro" | "fight" | "win" | "lose">("intro");
  const [score, setScore] = useState(0);
  const [hit, setHit] = useState<"boss" | "player" | null>(null);
  const [newHS, setNewHS] = useState(false);

  const shuffledOpts = useMemo(() => {
    const q = QUESTIONS[qIdx];
    const arr = q.options.map((text, origIdx) => ({ text, isRight: origIdx === q.correct }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx]);

  const curQ = QUESTIONS[qIdx];
  const curPhase = PHASES[phase];

  // Timer
  useEffect(() => {
    if (gameState !== "fight" || picked !== null) return;
    if (timeLeft <= 0) {
      // Timeout = Boss attackiert
      damagePlayer(18);
      nextQuestion();
      return;
    }
    const t = setTimeout(() => setTimeLeft((x) => x - 0.1), 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, gameState, picked]);

  function damagePlayer(dmg: number) {
    setHit("player");
    setTimeout(() => setHit(null), 300);
    setPlayerHp((hp) => {
      const n = hp - dmg;
      if (n <= 0) {
        setGameState("lose");
        return 0;
      }
      return n;
    });
  }

  function damageBoss(dmg: number, bonusMultiplier = 1) {
    setHit("boss");
    setTimeout(() => setHit(null), 300);
    const finalDmg = Math.round(dmg * bonusMultiplier);
    setBossHp((hp) => {
      const n = hp - finalDmg;
      if (n <= 0) {
        // Phase-Wechsel oder Sieg
        if (phase < PHASES.length - 1) {
          setTimeout(() => {
            setPhase((p) => p + 1);
            setBossHp(PHASES[phase + 1].hpMax);
            setTimeLeft(PHASES[phase + 1].answerTime);
          }, 800);
          return 0;
        }
        // Sieg
        const finalScore = score + finalDmg + Math.floor(playerHp / 2);
        setScore(finalScore);
        try {
          const hs = JSON.parse(localStorage.getItem(HS_KEY) ?? "{}");
          if (finalScore > (hs.boss ?? 0)) {
            hs.boss = finalScore;
            localStorage.setItem(HS_KEY, JSON.stringify(hs));
            setNewHS(true);
          }
        } catch {}
        setGameState("win");
        return 0;
      }
      return n;
    });
    setScore((s) => s + finalDmg);
  }

  function pickAnswer(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const correct = shuffledOpts[i].isRight;

    if (correct) {
      // Time-Bonus: schneller antworten = mehr Schaden
      const timeBonus = timeLeft > curPhase.answerTime * 0.6 ? 1.3 : timeLeft > curPhase.answerTime * 0.3 ? 1.0 : 0.7;
      const streakBonus = 1 + streak * 0.1;
      damageBoss(curQ.damage, timeBonus * streakBonus);
      setStreak(streak + 1);
    } else {
      damagePlayer(20);
      setStreak(0);
    }

    setTimeout(() => {
      if (gameState === "fight") nextQuestion();
    }, 700);
  }

  function nextQuestion() {
    setPicked(null);
    setTimeLeft(curPhase.answerTime);
    setQIdx((prev) => {
      let next = prev;
      while (next === prev) next = Math.floor(Math.random() * QUESTIONS.length);
      return next;
    });
  }

  function startGame() {
    setPhase(0);
    setBossHp(PHASES[0].hpMax);
    setPlayerHp(100);
    setStreak(0);
    setScore(0);
    setTimeLeft(PHASES[0].answerTime);
    setPicked(null);
    setQIdx(Math.floor(Math.random() * QUESTIONS.length));
    setNewHS(false);
    setGameState("fight");
  }

  // ─── Intro-Screen ──────────────────────────────────────────

  if (gameState === "intro") {
    return (
      <div className="space-y-5">
        <Button variant="ghost" onClick={onExit} size="sm">← Pausenspiele</Button>

        <div className="rounded-3xl border border-[#c29b62]/40 bg-gradient-to-br from-[#c29b62]/10 via-card/40 to-[#2dd4bf]/8 p-8 text-center space-y-5 relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#c29b62]/30 blur-3xl"
            />
            <motion.div
              animate={{ opacity: [0.2, 0.05, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
              className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[#2dd4bf]/30 blur-3xl"
            />
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="relative"
          >
            <div className="inline-flex h-20 w-20 rounded-2xl bg-gradient-to-br from-[#c29b62]/30 to-[#2dd4bf]/20 border border-[#c29b62]/50 items-center justify-center animate-pulse-amber">
              <ClawbuisMark className="h-12 w-12" />
            </div>
          </motion.div>

          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#c29b62] mb-2">Boss-Kampf</p>
            <h1 className="gravur text-3xl md:text-4xl font-medium">
              <span className="text-gradient">CLAWBUIS</span>·Raid
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto">
              Drei Phasen. Dein Wissen ist deine Waffe. Jede richtige Antwort schlägt den Boss,
              jede falsche kostet dich HP. Schnell antworten = mehr Schaden.
            </p>
          </div>

          <Button size="lg" onClick={startGame} className="rounded-xl shadow-lg shadow-[#c29b62]/30 bg-gradient-to-r from-[#c29b62] to-[#2dd4bf] text-black font-bold">
            <Swords className="mr-2 h-4 w-4" /> Kampf beginnen
          </Button>
        </div>

        {/* Regeln */}
        <div className="rounded-xl border border-border/40 bg-card/30 p-4 space-y-2 text-xs">
          <Rule icon={Heart} text="Du startest mit 100 HP." />
          <Rule icon={Swords} text="Richtige Antwort schadet dem Boss. Falsche Antwort verletzt dich." />
          <Rule icon={Zap} text="Schnell antworten = 1.3× Schaden · 10× Streak = bis zu 2× Schaden." />
          <Rule icon={Shield} text="Boss hat 3 Phasen: Schatten → Glüh → Meister. Jede Phase mehr HP + weniger Zeit." />
        </div>
      </div>
    );
  }

  // ─── Result-Screen ─────────────────────────────────────────

  if (gameState === "win" || gameState === "lose") {
    const won = gameState === "win";
    return (
      <div className="space-y-5">
        <Button variant="ghost" onClick={onExit} size="sm">← Pausenspiele</Button>

        <div className={`rounded-3xl border p-8 text-center space-y-5 relative overflow-hidden ${
          won ? "border-[#c29b62]/40 bg-gradient-to-br from-[#c29b62]/15 via-card/30 to-[#2dd4bf]/10" : "border-destructive/30 bg-gradient-to-br from-destructive/10 to-card/30"
        }`}>
          {newHS && (
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.4 }}
              className="absolute top-4 right-4 text-[10px] px-2 py-1 rounded bg-accent/20 border border-accent/50 text-accent font-bold uppercase tracking-[0.2em]"
            >
              Neuer Highscore
            </motion.div>
          )}

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={`inline-flex h-20 w-20 rounded-full items-center justify-center ${won ? "bg-[#c29b62]/20 glow-amber" : "bg-destructive/20"}`}
          >
            {won ? <Trophy className="h-10 w-10 text-[#c29b62]" /> : <Skull className="h-10 w-10 text-destructive" />}
          </motion.div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-2">
              {won ? "Sieg" : "Niederlage"}
            </p>
            <h2 className="gravur text-3xl md:text-4xl font-medium">
              {won ? "CLAWBUIS bezwungen." : "Der Boss triumphiert."}
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Score · <span className="gravur text-2xl text-accent font-semibold">{score}</span>
            </p>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <Button onClick={startGame}>
              <RotateCcw className="mr-2 h-4 w-4" /> Revanche
            </Button>
            <Button variant="outline" onClick={onExit}>Zurück</Button>
          </div>

          <ClawbuisCredit />
        </div>
      </div>
    );
  }

  // ─── Fight-Screen ──────────────────────────────────────────

  const bossHpPct = (bossHp / curPhase.hpMax) * 100;
  const playerHpPct = playerHp;
  const timePct = (timeLeft / curPhase.answerTime) * 100;

  return (
    <div className="space-y-5 relative">
      <Button variant="ghost" onClick={onExit} size="sm">← Abbrechen</Button>

      {/* Hit-Flash */}
      <AnimatePresence>
        {hit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 pointer-events-none z-20"
            style={{
              background: hit === "boss"
                ? "radial-gradient(circle, oklch(0.7 0.18 145 / 0.15), transparent 60%)"
                : "radial-gradient(circle, oklch(0.55 0.18 25 / 0.2), transparent 60%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Boss-Card */}
      <motion.div
        animate={hit === "boss" ? { x: [0, -6, 6, -4, 0] } : {}}
        transition={{ duration: 0.35 }}
        className="relative rounded-2xl border border-[#c29b62]/40 bg-gradient-to-br from-[#c29b62]/12 via-card/40 to-transparent p-5 overflow-hidden"
      >
        <div aria-hidden className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl" style={{ background: `${curPhase.theme}50` }} />

        <div className="relative flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, -3, 3, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-16 w-16 rounded-2xl border border-[#c29b62]/40 flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${curPhase.theme}, oklch(0.15 0.01 165))` }}
          >
            <ClawbuisMark className="h-10 w-10" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#c29b62]">Phase {phase + 1} / 3</p>
            <h2 className="gravur text-lg font-medium">{curPhase.name}</h2>
            <div className="mt-2 space-y-1">
              <div className="h-3 rounded-full bg-black/40 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-destructive via-accent to-[#c29b62]"
                  animate={{ width: `${bossHpPct}%` }}
                  transition={{ type: "spring", stiffness: 140 }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold">
                  {Math.max(0, bossHp)} / {curPhase.hpMax}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Player-Status */}
      <motion.div animate={hit === "player" ? { x: [0, -4, 4, -2, 0] } : {}} transition={{ duration: 0.3 }}>
        <div className="grid grid-cols-3 gap-2">
          <Stat icon={Heart} label="HP" value={playerHp} color="destructive" pct={playerHpPct} />
          <Stat icon={Zap}   label="Streak" value={streak} color="accent" />
          <Stat icon={Trophy} label="Score" value={score} color="primary" />
        </div>
      </motion.div>

      {/* Timer-Balken */}
      <div>
        <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] mb-1">
          <span className="text-muted-foreground">Zeit</span>
          <span className={`font-mono ${timeLeft < curPhase.answerTime * 0.3 ? "text-destructive animate-pulse" : "text-accent"}`}>
            {timeLeft.toFixed(1)}s
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${timeLeft < curPhase.answerTime * 0.3 ? "bg-destructive" : "bg-accent"}`}
            animate={{ width: `${timePct}%` }}
            transition={{ type: "tween", ease: "linear", duration: 0.1 }}
          />
        </div>
      </div>

      {/* Frage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="gravur text-lg md:text-xl mb-3 leading-tight">{curQ.q}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {shuffledOpts.map((o, i) => {
              const isRight = picked !== null && o.isRight;
              const isWrong = picked === i && !o.isRight;
              const dim = picked !== null && !o.isRight && picked !== i;
              return (
                <motion.button
                  key={i}
                  whileTap={picked === null ? { scale: 0.97 } : {}}
                  onClick={() => pickAnswer(i)}
                  disabled={picked !== null}
                  className="px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left"
                  style={{
                    borderColor: isRight ? "var(--success)" : isWrong ? "var(--destructive)" : "oklch(1 0 0 / 0.12)",
                    background:  isRight ? "oklch(0.7 0.18 145 / 0.15)" : isWrong ? "oklch(0.55 0.18 25 / 0.12)" : "oklch(1 0 0 / 0.02)",
                    color:       isRight ? "var(--success)" : isWrong ? "var(--destructive)" : "var(--foreground)",
                    opacity:     dim ? 0.35 : 1,
                  }}
                >
                  {o.text}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Rule({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-3.5 w-3.5 text-accent shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color, pct }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; color: "destructive" | "accent" | "primary"; pct?: number;
}) {
  const colorCls = {
    destructive: "text-destructive border-destructive/30 bg-destructive/5",
    accent:      "text-accent border-accent/30 bg-accent/5",
    primary:     "text-primary border-primary/30 bg-primary/5",
  }[color];
  return (
    <div className={`rounded-xl border p-2.5 text-center ${colorCls}`}>
      <div className="flex items-center justify-center gap-1">
        <Icon className="h-3 w-3" />
        <span className="text-[9px] uppercase tracking-[0.2em] opacity-70">{label}</span>
      </div>
      <p className="gravur text-xl font-bold mt-0.5">{value}</p>
      {pct !== undefined && (
        <div className="mt-1 h-1 bg-black/30 rounded-full overflow-hidden">
          <motion.div className="h-full bg-current" animate={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
