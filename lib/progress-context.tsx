"use client";

/**
 * ProgressContext · Mastery + User-Stats zentral
 *
 * EXAM-AWARE SPACED REPETITION:
 * - Leitner-Intervalle passen sich ans Prüfungsdatum an (engere Review-Zyklen
 *   je näher die Prüfung rückt).
 * - "Stale-Push": Fragen > 7 Tage nicht gesehen + mastery < 95 werden forciert.
 * - Endspurt-Modus: ≤ 7 Tage bis Prüfung → alle Fragen täglich rotieren.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, APP_NS } from "./firebase";
import { useAuth } from "./auth-context";
import { type Cluster, type UserStats, LEVELS, getLevel } from "./types";

// ─── Typen ─────────────────────────────────────────────────────────

export type LeitnerBox = 0 | 1 | 2 | 3 | 4 | 5;

export interface AttemptRecord { ts: number; correct: boolean; partial?: boolean; respSec: number; }

export interface FrageProgress {
  frageId: string;
  box: LeitnerBox;
  lastSeen: number;
  nextReview: number;
  timesCorrect: number;
  timesWrong: number;
  timesPartial: number;
  history: AttemptRecord[];
  streak: number;
}

export type ExamPhase = "weit" | "normal" | "intensiv" | "eng" | "preexam" | "endspurt";

const PROGRESS_KEY = "meister3-progress";
const STATS_KEY    = "meister3-stats";
const EXAM_DATE    = "2026-05-09";  // aus stundenplan.json

const FRESH_STATS: UserStats = {
  xp: 0,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: "",
  dailyGoalProgress: 0,
  dailyGoalTarget: 20,
  lessonsCompleted: [],
  achievements: [],
};

// ─── EXAM-AWARE LEITNER-INTERVALS ─────────────────────────────────

export function daysToExam(): number {
  const now = Date.now();
  const exam = new Date(EXAM_DATE + "T09:00:00").getTime();
  return Math.max(0, Math.ceil((exam - now) / 86400000));
}

export function getExamPhase(d: number = daysToExam()): ExamPhase {
  if (d <= 2)  return "endspurt";   // alles täglich
  if (d <= 7)  return "preexam";    // alle 1-3 Tage
  if (d <= 14) return "eng";
  if (d <= 30) return "intensiv";
  if (d <= 60) return "normal";
  return "weit";
}

/** Review-Intervalle in Tagen pro Leitner-Box · exam-aware */
export function getLeitnerIntervals(phase: ExamPhase): Record<LeitnerBox, number> {
  switch (phase) {
    case "endspurt":  return { 0: 0,   1: 0.5, 2: 1,  3: 1,  4: 1,  5: 1 };
    case "preexam":   return { 0: 0,   1: 1,   2: 1,  3: 2,  4: 3,  5: 3 };
    case "eng":       return { 0: 0,   1: 1,   2: 2,  3: 4,  4: 5,  5: 7 };
    case "intensiv":  return { 0: 0,   1: 1,   2: 3,  3: 5,  4: 7,  5: 10 };
    case "normal":    return { 0: 0,   1: 1,   2: 3,  3: 7,  4: 10, 5: 14 };
    default:          return { 0: 0,   1: 1,   2: 3,  3: 7,  4: 14, 5: 30 };
  }
}

export function getPhaseLabel(phase: ExamPhase): { text: string; color: string; rot: boolean } {
  const M: Record<ExamPhase, { text: string; color: string; rot: boolean }> = {
    endspurt: { text: "Endspurt", color: "var(--destructive)", rot: true },
    preexam:  { text: "Pre-Exam", color: "var(--destructive)", rot: true },
    eng:      { text: "Engphase", color: "var(--accent)",      rot: false },
    intensiv: { text: "Intensiv", color: "var(--accent)",      rot: false },
    normal:   { text: "Normal",   color: "var(--primary)",     rot: false },
    weit:     { text: "Start",    color: "var(--primary)",     rot: false },
  };
  return M[phase];
}

// ─── Mastery-Calcs ─────────────────────────────────────────────────

export function calcMastery(p: FrageProgress): number {
  if (p.history.length === 0) return 0;
  const weights = [1.0, 0.7, 0.5, 0.3, 0.15];
  let score = 0, wTot = 0;
  p.history.slice(0, 5).forEach((a, i) => {
    const w = weights[i] ?? 0.1;
    let pts = 0;
    if (a.correct && !a.partial) pts = a.respSec < 8 ? 110 : a.respSec > 25 ? 85 : 100;
    else if (a.partial) pts = 55;
    score += pts * w; wTot += w;
  });
  let m = wTot === 0 ? 0 : score / wTot;

  // Comeback-Erkennung: wieviele Falschantworten gab es direkt vor der aktuellen Richtig-Serie?
  let preComebackFails = 0;
  if (p.streak > 0 && p.history.length > p.streak) {
    for (let i = p.streak; i < p.history.length; i++) {
      const a = p.history[i];
      if (!a.correct || a.partial) preComebackFails++;
      else break;
    }
  }
  const isComeback = preComebackFails >= 3;

  // Streak-Bonus · nicht-linear: zweite und dritte Richtige nach Fehler-Serie
  // werden stärker belohnt, weil sie den Lerneffekt bestätigen.
  // Normal:   1→4%  2→8%  3→12%  4→16%  5→20%
  // Comeback: 1→5%  2→20% 3→30%  4→35%  5→40%  ← non-linear jump at streak 2
  const comebackBonus = [0, 0.05, 0.20, 0.30, 0.35, 0.40];
  const normalBonus = (s: number) => Math.min(s * 0.04, 0.2);
  const bonus = isComeback
    ? (comebackBonus[Math.min(p.streak, 5)] ?? 0.40)
    : normalBonus(p.streak);
  m *= 1 + bonus;

  const days = (Date.now() - p.lastSeen) / 86400000;
  if (days > 0.5) m *= Math.pow(0.5, days / 14);
  return Math.round(Math.min(Math.max(m, 0), 100));
}

/** Gibt dem UI die Stats pro Frage in lesbarer Form */
export function calcFrageStats(p: FrageProgress | undefined) {
  if (!p || p.history.length === 0) {
    return { attempts: 0, correct: 0, wrong: 0, partial: 0, streak: 0, mastery: 0, fresh: true, isComeback: false };
  }
  const attempts = p.history.length;
  const correct = p.history.filter((a) => a.correct && !a.partial).length;
  const wrong = p.history.filter((a) => !a.correct).length;
  const partial = p.history.filter((a) => a.partial).length;

  // Comeback-Flag
  let preFails = 0;
  if (p.streak > 0 && p.history.length > p.streak) {
    for (let i = p.streak; i < p.history.length; i++) {
      const a = p.history[i];
      if (!a.correct || a.partial) preFails++;
      else break;
    }
  }
  return {
    attempts, correct, wrong, partial,
    streak: p.streak,
    mastery: calcMastery(p),
    fresh: false,
    isComeback: preFails >= 3 && p.streak >= 2,
  };
}

export function calcConfidence(attempts: number): number {
  return 1 - 0.6 / (1 + attempts * 0.4);
}

/**
 * Frische-Score · wie kürzlich wurde die Frage gesehen?
 * 100 = heute, 0 = > 14 Tage her.
 */
export function calcFreshness(p: FrageProgress): number {
  if (p.history.length === 0) return 0;
  const days = (Date.now() - p.lastSeen) / 86400000;
  if (days < 1) return 100;
  if (days > 14) return 0;
  return Math.round(100 - (days / 14) * 100);
}

/**
 * "Gemeistert" nur wenn alle 3 Bedingungen zutreffen:
 *  - mastery ≥ 90
 *  - streak ≥ 3
 *  - letzte Antwort < Stale-Threshold (je nach Exam-Phase)
 */
export function isWirklichGemeistert(p: FrageProgress, phase: ExamPhase = getExamPhase()): boolean {
  if (calcMastery(p) < 90) return false;
  if (p.streak < 3) return false;
  const days = (Date.now() - p.lastSeen) / 86400000;
  const staleMap: Record<ExamPhase, number> = {
    endspurt: 1.5, preexam: 3, eng: 5, intensiv: 8, normal: 14, weit: 30,
  };
  return days <= staleMap[phase];
}

export function deriveBox(mastery: number, streak: number): LeitnerBox {
  if (mastery >= 90 && streak >= 3) return 5;
  if (mastery >= 75 && streak >= 2) return 4;
  if (mastery >= 60) return 3;
  if (mastery >= 40) return 2;
  if (mastery >= 20) return 1;
  return 0;
}

// ─── Adaptive Selection · Exam-aware ─────────────────────────────

export function selectAdaptive(
  allIds: string[],
  progress: Record<string, FrageProgress>,
  count: number,
  mode: "spaced" | "schwach" | "neu" | "mix" = "mix",
  phase: ExamPhase = getExamPhase(),
): string[] {
  const now = Date.now();
  const staleThreshold = phase === "endspurt" ? 1 :
                         phase === "preexam"  ? 2 :
                         phase === "eng"      ? 3 :
                         phase === "intensiv" ? 5 :
                                                7; // Tage

  const enriched = allIds.map((id) => {
    const p = progress[id];
    const gesehen = !!p && p.history.length > 0;
    const ueberfaellig = p ? p.nextReview <= now : true;
    const m = p ? calcMastery(p) : 0;
    const c = p ? calcConfidence(p.timesCorrect + p.timesWrong + p.timesPartial) : 0;
    const days = p && p.lastSeen ? (now - p.lastSeen) / 86400000 : 999;
    const stale = days > staleThreshold;
    return { id, gesehen, ueberfaellig, stale, mEff: m * c, mastery: m };
  });

  // Endspurt: alle gesehenen Fragen mit mastery < 95 rotieren + neue
  if (phase === "endspurt") {
    const tofill = enriched
      .filter((x) => x.gesehen && x.mastery < 95)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, Math.floor(count * 0.8))
      .map((x) => x.id);
    const neu = enriched.filter((x) => !x.gesehen).slice(0, count - tofill.length).map((x) => x.id);
    return [...tofill, ...neu].slice(0, count);
  }

  if (mode === "schwach") {
    return enriched
      .filter((x) => x.gesehen && x.mEff < 50)
      .sort((a, b) => a.mEff - b.mEff)
      .slice(0, count).map((x) => x.id);
  }
  if (mode === "neu") {
    return enriched.filter((x) => !x.gesehen).slice(0, count).map((x) => x.id);
  }
  if (mode === "spaced") {
    return enriched.filter((x) => x.ueberfaellig || x.stale)
      .sort((a, b) => a.mEff - b.mEff)
      .slice(0, count).map((x) => x.id);
  }
  // mix · 20 % stale-Push (long-unseen) + 50 % schwach · 30 % neu
  const stale = enriched.filter((x) => x.stale && x.gesehen && x.mastery < 95)
    .sort((a, b) => b.mEff - a.mEff)  // hohe mastery zuerst, die könnten vergessen werden
    .slice(0, Math.floor(count * 0.2)).map((x) => x.id);
  const schwach = enriched.filter((x) => x.gesehen && !stale.includes(x.id) && (x.ueberfaellig || x.mEff < 60))
    .sort((a, b) => a.mEff - b.mEff)
    .slice(0, Math.floor(count * 0.5)).map((x) => x.id);
  const neu = enriched.filter((x) => !x.gesehen && !stale.includes(x.id) && !schwach.includes(x.id))
    .slice(0, count - stale.length - schwach.length).map((x) => x.id);
  const rest = enriched.filter((x) => !stale.includes(x.id) && !schwach.includes(x.id) && !neu.includes(x.id))
    .sort((a, b) => a.mEff - b.mEff)
    .slice(0, count - stale.length - schwach.length - neu.length).map((x) => x.id);
  return [...stale, ...schwach, ...neu, ...rest].slice(0, count);
}

function today(): string { return new Date().toISOString().slice(0, 10); }

// ─── Context ──────────────────────────────────────────────────────

interface Ctx {
  progress: Record<string, FrageProgress>;
  stats: UserStats;
  recordAnswer: (frageId: string, correct: boolean, respSec: number, partial?: boolean, hintUsed?: boolean) => void;
  recordLessonComplete: (slug: string) => void;
  resetAll: () => void;
  getHFMastery: (cluster: Cluster, ids: string[]) => { avg: number; gesehen: number; gemeistert: number };
  examPhase: ExamPhase;
  daysLeft: number;
}

const Context = createContext<Ctx | null>(null);

const PROGRESS_COL = `progress-${APP_NS}`;
const STATS_COL = `stats-${APP_NS}`;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<Record<string, FrageProgress>>({});
  const [stats, setStats] = useState<UserStats>(FRESH_STATS);
  const lastUidRef = useRef<string | null>(null);

  // Initial load aus localStorage · immer (instant cache)
  useEffect(() => {
    try {
      const p = localStorage.getItem(PROGRESS_KEY);
      if (p) setProgress(JSON.parse(p));
      const s = localStorage.getItem(STATS_KEY);
      if (s) setStats({ ...FRESH_STATS, ...JSON.parse(s) });
    } catch {}
  }, []);

  // Firestore-Sync bei Login
  useEffect(() => {
    if (authLoading || !user || user.isGuest) return;
    if (lastUidRef.current === user.uid) return;
    lastUidRef.current = user.uid;

    (async () => {
      try {
        const [progSnap, statsSnap] = await Promise.all([
          getDoc(doc(db, PROGRESS_COL, user.uid)),
          getDoc(doc(db, STATS_COL, user.uid)),
        ]);
        if (progSnap.exists()) {
          const cloud = progSnap.data() as Record<string, FrageProgress>;
          setProgress(cloud);
          localStorage.setItem(PROGRESS_KEY, JSON.stringify(cloud));
        } else {
          // leere Cloud: lokale Daten in Cloud pushen
          const local = localStorage.getItem(PROGRESS_KEY);
          if (local) await setDoc(doc(db, PROGRESS_COL, user.uid), JSON.parse(local));
        }
        if (statsSnap.exists()) {
          const cloudS = statsSnap.data() as UserStats;
          setStats({ ...FRESH_STATS, ...cloudS });
          localStorage.setItem(STATS_KEY, JSON.stringify(cloudS));
        } else {
          const local = localStorage.getItem(STATS_KEY);
          if (local) await setDoc(doc(db, STATS_COL, user.uid), JSON.parse(local));
        }
      } catch (err) {
        console.warn("Progress cloud-sync skipped:", err);
      }
    })();
  }, [user, authLoading]);

  const examPhase = useMemo(() => getExamPhase(), []);
  const daysLeft = useMemo(() => daysToExam(), []);

  const persist = (newP: Record<string, FrageProgress>, newS: UserStats) => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(newP));
    localStorage.setItem(STATS_KEY,    JSON.stringify(newS));
    setProgress(newP); setStats(newS);
    // Cloud-Sync fire-and-forget bei eingeloggtem User
    if (user && !user.isGuest) {
      setDoc(doc(db, PROGRESS_COL, user.uid), newP).catch(() => {});
      setDoc(doc(db, STATS_COL,    user.uid), newS).catch(() => {});
    }
  };

  const recordAnswer = useCallback((frageId: string, correct: boolean, respSec: number, partial?: boolean, hintUsed?: boolean) => {
    const now = Date.now();
    const prev = progress[frageId] ?? null;
    const attempt: AttemptRecord = { ts: now, correct, respSec, partial };
    const history = [attempt, ...(prev?.history ?? [])].slice(0, 10);
    const timesCorrect = (prev?.timesCorrect ?? 0) + (correct && !partial ? 1 : 0);
    const timesWrong = (prev?.timesWrong ?? 0) + (!correct ? 1 : 0);
    const timesPartial = (prev?.timesPartial ?? 0) + (partial ? 1 : 0);
    let streak = correct && !partial ? (prev?.streak ?? 0) + 1 : 0;
    if (partial) streak = Math.max(0, Math.floor((prev?.streak ?? 0) / 2));
    const mastery = calcMastery({
      frageId, box: 0, lastSeen: now, nextReview: 0,
      timesCorrect, timesWrong, timesPartial, history, streak,
    });
    const box = deriveBox(mastery, streak);
    const intervals = getLeitnerIntervals(examPhase);
    const nextReview = now + intervals[box] * 86400000;
    const newFP: FrageProgress = { frageId, box, lastSeen: now, nextReview, timesCorrect, timesWrong, timesPartial, history, streak };
    const newProgress = { ...progress, [frageId]: newFP };

    let xpAdd = 0;
    if (correct && !partial) xpAdd = 12 + (streak >= 3 ? 4 : 0);
    else if (partial)         xpAdd = 6;
    else                      xpAdd = 2;
    // Hinweis-Nutzung: XP auf 60% (runden ab, min 1)
    if (hintUsed) xpAdd = Math.max(1, Math.round(xpAdd * 0.6));

    const td = today();
    const newDailyProgress = stats.lastActiveDate === td ? stats.dailyGoalProgress + 1 : 1;
    let newCurrentStreak = stats.currentStreak;
    if (stats.lastActiveDate !== td) {
      const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      newCurrentStreak = stats.lastActiveDate === yest ? stats.currentStreak + 1 : 1;
    }
    const newStats: UserStats = {
      ...stats,
      xp: stats.xp + xpAdd,
      totalQuestionsAnswered: stats.totalQuestionsAnswered + 1,
      totalCorrect: stats.totalCorrect + (correct && !partial ? 1 : 0),
      lastActiveDate: td,
      dailyGoalProgress: newDailyProgress,
      currentStreak: newCurrentStreak,
      longestStreak: Math.max(stats.longestStreak, newCurrentStreak),
    };
    persist(newProgress, newStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, stats, examPhase]);

  const recordLessonComplete = useCallback((slug: string) => {
    if (stats.lessonsCompleted.includes(slug)) return;
    const newStats: UserStats = {
      ...stats,
      lessonsCompleted: [...stats.lessonsCompleted, slug],
      xp: stats.xp + 40,
    };
    persist(progress, newStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, progress]);

  const resetAll = useCallback(() => {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(STATS_KEY);
    setProgress({}); setStats(FRESH_STATS);
  }, []);

  const getHFMastery = useCallback((cluster: Cluster, ids: string[]) => {
    let sum = 0, gesehen = 0, gemeistert = 0;
    for (const id of ids) {
      const p = progress[id];
      if (!p || p.history.length === 0) continue;
      gesehen++;
      const m = calcMastery(p);
      sum += m;
      if (isWirklichGemeistert(p, examPhase)) gemeistert++;
    }
    return { avg: gesehen === 0 ? 0 : Math.round(sum / gesehen), gesehen, gemeistert };
  }, [progress, examPhase]);

  return (
    <Context.Provider value={{ progress, stats, recordAnswer, recordLessonComplete, resetAll, getHFMastery, examPhase, daysLeft }}>
      {children}
    </Context.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useProgress must be inside ProgressProvider");
  return ctx;
}

export { LEVELS, getLevel };
