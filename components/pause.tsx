"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NavBar } from "@/components/nav-bar";
import { ClawbuisFooter } from "@/components/clawbuis-badge";
import { ClawbuisMark } from "@/components/clawbuis-mark";
import { BossFight } from "@/components/boss-fight";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, Calculator, Swords, Trophy, RotateCcw, ChevronRight, Sparkles } from "lucide-react";

type Game = "menu" | "rechtsform" | "kalk" | "boss";

const HS_KEY = "meister3-highscores";
function getHS(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(HS_KEY) ?? "{}"); } catch { return {}; }
}
function setHS(game: string, score: number) {
  const hs = getHS();
  if (score > (hs[game] ?? 0)) { hs[game] = score; localStorage.setItem(HS_KEY, JSON.stringify(hs)); return true; }
  return false;
}

export function Pause() {
  const [game, setGame] = useState<Game>("menu");
  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {game === "menu" && <Menu onPick={setGame} />}
        {game === "rechtsform" && <RechtsformMatch onBack={() => setGame("menu")} />}
        {game === "kalk" && <KalkBaukasten onBack={() => setGame("menu")} />}
        {game === "boss" && <BossFight onExit={() => setGame("menu")} />}
      </main>
    </div>
  );
}

function Menu({ onPick }: { onPick: (g: Game) => void }) {
  const [hs, setHsState] = useState<Record<string, number>>({});
  useEffect(() => setHsState(getHS()), []);

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="gravur text-2xl md:text-3xl font-medium leading-tight">
          <span className="text-gradient">Pausenspiele</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Spielerisch trainieren · Boss-Raid, Match, Kalkulieren.
        </p>
      </motion.div>

      {/* CLAWBUIS-Raid · Highlight-Game */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          onClick={() => onPick("boss")}
          className="relative overflow-hidden cursor-pointer border-[#c29b62]/40 bg-gradient-to-br from-[#c29b62]/15 via-card/40 to-[#2dd4bf]/10 hover:border-[#c29b62]/70 transition-all group animate-pulse-amber"
        >
          {/* Atmosphere glows */}
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ opacity: [0.3, 0.15, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/2 right-6 w-32 h-32 rounded-full bg-[#c29b62]/30 blur-3xl"
            />
            <motion.div
              animate={{ opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
              className="absolute bottom-0 left-10 w-40 h-40 rounded-full bg-[#2dd4bf]/20 blur-3xl"
            />
          </div>

          <CardContent className="p-5 md:p-6 flex items-center gap-4 relative">
            <motion.div
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#c29b62]/30 to-[#2dd4bf]/20 border border-[#c29b62]/50 flex items-center justify-center shrink-0"
            >
              <ClawbuisMark className="h-8 w-8" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Sparkles className="h-3 w-3 text-[#c29b62]" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c29b62] font-bold">Das Highlight</p>
              </div>
              <h3 className="gravur text-lg font-medium">
                <span className="text-gradient">CLAWBUIS</span>·Raid
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                3-Phasen Boss-Kampf · Wissen als Waffe · Zeitdruck · Schaden-Combos
              </p>
              {(hs.boss ?? 0) > 0 && (
                <p className="text-[10px] mt-2 flex items-center gap-1 text-accent">
                  <Trophy className="h-2.5 w-2.5" /> Highscore: <strong>{hs.boss}</strong>
                </p>
              )}
            </div>
            <Swords className="h-5 w-5 text-[#c29b62] group-hover:scale-110 group-hover:rotate-12 transition-transform shrink-0" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Weitere Spiele */}
      <div className="grid gap-3">
        <GameTile
          onClick={() => onPick("rechtsform")}
          icon={Landmark}
          title="Rechtsform-Match"
          desc="Merkmal → richtige Rechtsform · 10 Runden"
          color="primary"
          highscore={hs.rechtsform}
          hsLabel="Pkt."
        />
        <GameTile
          onClick={() => onPick("kalk")}
          icon={Calculator}
          title="Kalkulations-Baukasten"
          desc="Angebotspreis aufbauen · Sandbox-Rechner"
          color="accent"
        />
      </div>

      <ClawbuisFooter />
    </div>
  );
}

function GameTile({
  onClick, icon: Icon, title, desc, color, highscore, hsLabel,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string; desc: string; color: "primary" | "accent";
  highscore?: number; hsLabel?: string;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Card onClick={onClick} className="border-border/40 hover:border-primary/40 bg-card/50 transition-all cursor-pointer group">
        <CardContent className="p-5 flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
            color === "primary" ? "bg-primary/15 border border-primary/30 text-primary" : "bg-accent/15 border border-accent/30 text-accent"
          }`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            {highscore !== undefined && highscore > 0 && (
              <p className="text-[10px] mt-1.5 flex items-center gap-1 text-accent">
                <Trophy className="h-2.5 w-2.5" /> Highscore: <strong>{highscore}</strong> {hsLabel}
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Rechtsform-Match (aus bestehender Version) ─────────────────

interface RFMatch { id: string; merkmal: string; rechtsform: string; }

const MATCHES: RFMatch[] = [
  { id: "1",  merkmal: "Stammkapital 25.000 €",                       rechtsform: "GmbH" },
  { id: "2",  merkmal: "Mindestkapital 50.000 €",                     rechtsform: "AG" },
  { id: "3",  merkmal: "Haftung mit Privatvermögen",                  rechtsform: "e.K." },
  { id: "4",  merkmal: "Komplementär + Kommanditist",                 rechtsform: "KG" },
  { id: "5",  merkmal: "Alle unbeschränkt solidarisch",               rechtsform: "OHG" },
  { id: "6",  merkmal: "Mitglieder · Selbstverwaltung",               rechtsform: "eG" },
  { id: "7",  merkmal: "1 € Mindestkapital + Rücklagepflicht",        rechtsform: "UG" },
  { id: "8",  merkmal: "Keine Buchführungspflicht < 800.000 €",       rechtsform: "e.K." },
  { id: "9",  merkmal: "Aktien · Aufsichtsrat Pflicht",               rechtsform: "AG" },
  { id: "10", merkmal: "Transparente Besteuerung · ESt",              rechtsform: "OHG" },
  { id: "11", merkmal: "Körperschaftsteuer 15 %",                     rechtsform: "GmbH" },
  { id: "12", merkmal: "Notar-Pflicht bei Gründung",                  rechtsform: "GmbH" },
];

const RECHTSFORMEN = ["e.K.", "OHG", "KG", "GmbH", "AG", "eG", "UG"];

function RechtsformMatch({ onBack }: { onBack: () => void }) {
  const [current, setCurrent] = useState<RFMatch>(() => MATCHES[Math.floor(Math.random() * MATCHES.length)]);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);
  const [done, setDone] = useState(false);
  const [newHS, setNewHS] = useState(false);

  const pick = (rf: string) => {
    if (feedback !== null) return;
    const correct = rf === current.rechtsform;
    setFeedback(correct ? "right" : "wrong");
    if (correct) setScore(score + 1);
    setTimeout(() => {
      setFeedback(null);
      const newRounds = rounds + 1;
      setRounds(newRounds);
      if (newRounds >= 10) {
        const finalScore = score + (correct ? 1 : 0);
        setNewHS(setHS("rechtsform", finalScore));
        setDone(true);
      } else {
        let next = current;
        while (next.id === current.id) next = MATCHES[Math.floor(Math.random() * MATCHES.length)];
        setCurrent(next);
      }
    }, 700);
  };

  const reset = () => {
    setScore(0); setRounds(0); setDone(false); setFeedback(null); setNewHS(false);
    setCurrent(MATCHES[Math.floor(Math.random() * MATCHES.length)]);
  };

  if (done) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" onClick={onBack} size="sm">← Pausenspiele</Button>
        <Card className="border-primary/30 bg-primary/5 relative overflow-hidden">
          <CardContent className="p-8 text-center space-y-4 relative">
            {newHS && (
              <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.3 }}
                className="absolute top-4 right-4 text-xs px-2 py-1 rounded bg-accent/20 border border-accent/40 text-accent font-bold">
                NEUER HIGHSCORE
              </motion.div>
            )}
            <Trophy className="h-12 w-12 text-accent mx-auto animate-float" />
            <h2 className="gravur text-3xl">
              {score >= 9 ? "Meisterlich!" : score >= 7 ? "Stark." : score >= 4 ? "Solide." : "Nochmal?"}
            </h2>
            <p className="text-sm text-muted-foreground">{score} von 10 richtig</p>
            <div className="flex gap-2 justify-center pt-2">
              <Button onClick={reset}><RotateCcw className="mr-2 h-4 w-4" />Nochmal</Button>
              <Button variant="outline" onClick={onBack}>Zurück</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} size="sm">← Pausenspiele</Button>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">Runde <strong className="text-foreground font-mono">{rounds + 1}/10</strong></span>
          <span className="text-success font-mono">✓ {score}</span>
        </div>
      </div>

      <h2 className="gravur text-xl font-medium">Rechtsform-Match</h2>
      <p className="text-xs text-muted-foreground">Zu welcher Rechtsform gehört das Merkmal?</p>

      <AnimatePresence mode="wait">
        <motion.div key={current.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }}>
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-8 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-accent mb-3">Merkmal</p>
              <p className="gravur text-xl md:text-2xl">{current.merkmal}</p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {RECHTSFORMEN.map((rf) => {
          const isRight = feedback === "right" && rf === current.rechtsform;
          const isWrong = feedback === "wrong" && rf === current.rechtsform;
          return (
            <motion.button
              key={rf}
              onClick={() => pick(rf)}
              disabled={feedback !== null}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-4 rounded-xl border text-center font-semibold transition-all text-lg"
              style={{
                borderColor: isRight ? "var(--success)" : isWrong ? "var(--destructive)" : "oklch(1 0 0 / 0.15)",
                background: isRight ? "oklch(0.7 0.18 145 / 0.15)" : isWrong ? "oklch(0.55 0.18 25 / 0.12)" : "oklch(1 0 0 / 0.02)",
                color: isRight ? "var(--success)" : isWrong ? "var(--destructive)" : "var(--foreground)",
              }}
            >
              {rf}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Kalkulations-Baukasten ────────────────────────────────

function KalkBaukasten({ onBack }: { onBack: () => void }) {
  const [material, setMaterial] = useState(200);
  const [arbeit, setArbeit] = useState(8);
  const [stundensatz, setStundensatz] = useState(55);
  const [gemeinkostenPct, setGemeinkostenPct] = useState(15);
  const [gewinnPct, setGewinnPct] = useState(12);

  const arbeitskosten = arbeit * stundensatz;
  const selbstkosten = material + arbeitskosten;
  const gemeinkosten = selbstkosten * (gemeinkostenPct / 100);
  const zwischensumme = selbstkosten + gemeinkosten;
  const gewinn = zwischensumme * (gewinnPct / 100);
  const nettoPreis = zwischensumme + gewinn;
  const bruttoPreis = nettoPreis * 1.19;

  return (
    <div className="space-y-5">
      <Button variant="ghost" onClick={onBack} size="sm">← Pausenspiele</Button>
      <div>
        <h2 className="gravur text-xl font-medium">Kalkulations-Baukasten</h2>
        <p className="text-xs text-muted-foreground mt-1">Stelle deinen Angebotspreis zusammen · jede Zutat live sichtbar.</p>
      </div>

      <Card className="border-border/40 bg-card/50">
        <CardContent className="p-5 space-y-4">
          <Slider label="Material"              unit="€"   value={material}        min={50}  max={2000} step={50} onChange={setMaterial} />
          <Slider label="Arbeitszeit"           unit="h"   value={arbeit}          min={1}   max={80}   step={1}  onChange={setArbeit} />
          <Slider label="Stundensatz"           unit="€/h" value={stundensatz}     min={35}  max={120}  step={5}  onChange={setStundensatz} />
          <Slider label="Gemeinkosten-Zuschlag" unit="%"   value={gemeinkostenPct} min={5}   max={40}   step={1}  onChange={setGemeinkostenPct} />
          <Slider label="Gewinn-Zuschlag"       unit="%"   value={gewinnPct}       min={5}   max={30}   step={1}  onChange={setGewinnPct} />
        </CardContent>
      </Card>

      <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-accent/3">
        <CardContent className="p-5 space-y-1.5 font-mono text-sm">
          <Row label="Material" value={material} />
          <Row label={`Arbeitskosten (${arbeit} h × ${stundensatz} €)`} value={arbeitskosten} />
          <Row label="= Selbstkosten" value={selbstkosten} bold />
          <Row label={`+ Gemeinkosten (${gemeinkostenPct} %)`} value={gemeinkosten} muted />
          <Row label={`+ Gewinn (${gewinnPct} %)`} value={gewinn} muted />
          <Row label="= Netto-Preis" value={nettoPreis} bold />
          <Row label="+ 19 % USt" value={nettoPreis * 0.19} muted />
          <div className="border-t border-accent/30 pt-2 mt-2">
            <Row label="= Angebotspreis brutto" value={bruttoPreis} bold highlight />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Slider({ label, unit, value, min, max, step, onChange }: {
  label: string; unit: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-end justify-between mb-1.5">
        <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
        <span className="font-mono text-sm font-semibold text-accent">{value.toLocaleString("de-DE")} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </div>
  );
}

function Row({ label, value, bold = false, muted = false, highlight = false }: { label: string; value: number; bold?: boolean; muted?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-baseline ${muted ? "text-muted-foreground" : ""}`}>
      <span className={bold ? "font-semibold" : ""}>{label}</span>
      <span className={`${bold ? "font-semibold" : ""} ${highlight ? "text-accent text-base" : ""}`}>
        {value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
      </span>
    </div>
  );
}
