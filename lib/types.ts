/**
 * Core-Types · Teil III Meister-Atelier
 */

export type Cluster =
  | "rechnungswesen-buchfuehrung"
  | "kalkulation-kosten"
  | "unternehmensgruendung"
  | "unternehmensfuehrung"
  | "marketing-markt"
  | "steuer-recht";

export const CLUSTERS: {
  id: Cluster;
  label: string;
  short: string;
  hue: number;
  icon: string;
}[] = [
  { id: "rechnungswesen-buchfuehrung", label: "Rechnungswesen & Buchführung", short: "Buchführung", hue: 200, icon: "BookOpen" },
  { id: "kalkulation-kosten",          label: "Kalkulation & Kosten",         short: "Kalkulation", hue: 30,  icon: "Calculator" },
  { id: "unternehmensgruendung",       label: "Unternehmensgründung",         short: "Gründung",    hue: 75,  icon: "Landmark" },
  { id: "unternehmensfuehrung",        label: "Unternehmensführung",          short: "Führung",     hue: 260, icon: "Compass" },
  { id: "marketing-markt",             label: "Marketing & Markt",            short: "Marketing",   hue: 145, icon: "LineChart" },
  { id: "steuer-recht",                label: "Steuer & Recht",               short: "Steuer",      hue: 10,  icon: "Scale" },
];

export type QuestionType = "mc-4" | "mc-5" | "offen" | "rechnen" | "matrix-ankreuzen" | "liste" | "wahr-falsch";

export interface MCAnswer { text: string; korrekt: boolean; erklaerung?: string; }

export interface RechnenPayload {
  formel: string;
  eingabe_felder: { label: string; einheit: string }[];
  loesung_wert: number;
  loesung_toleranz: number;
  zwischenschritte?: string[];
}

export interface ListePayload { mindestanzahl: number; muster_items: string[]; }

export interface Source {
  quellen_id: string; frage_nr?: number; datei?: string; seite?: number; seite_ab?: number; note?: string;
}

export interface Frage {
  id: string;
  typ: QuestionType;
  thema: string;
  cluster: Cluster;
  schwierigkeit: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  kontext?: string;
  antworten?: MCAnswer[];
  rechnen?: RechnenPayload;
  liste?: ListePayload;
  musterantwort?: string;
  musterpunkte?: string[];
  hinweis?: string;       // strategischer Denk-Ansatz (keine Antwort) · zeigt mit XP-Penalty
  eselsbruecke?: string;  // kreative Merkhilfe · wird nach Antwort gezeigt
  tags: string[];
  sources: Source[];
  erstellt_am: string;
  korrigiert_am?: string;
  korrektur_note?: string;
}

export interface ThemaFrontmatter {
  slug: string;
  titel: string;
  cluster: Cluster;
  reihenfolge: number;
  dauer_min: number;
  schwierigkeit: number;
  quellen?: string[];
  dozent_primaer?: string;
  fragen: string[];
}

export interface Thema {
  frontmatter: ThemaFrontmatter;
  body: string;
}

export interface StundenplanTag {
  nr: number;
  datum: string;
  wochentag: string;
  themen_ids: string[];
  dozenten: string[];
  materialien: string[];
}

// ─── Gamification ────────────────────────────────────────────────────

export interface UserStats {
  xp: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  currentStreak: number;        // Tage
  longestStreak: number;
  lastActiveDate: string;       // ISO yyyy-mm-dd
  dailyGoalProgress: number;    // Fragen heute
  dailyGoalTarget: number;      // Default 20
  lessonsCompleted: string[];   // slugs
  achievements: string[];
}

export interface Level {
  level: number;
  title: string;
  xpRequired: number;
  icon: string;
}

export const LEVELS: Level[] = [
  { level: 1, title: "Prüfling",        xpRequired: 0,      icon: "📋" },
  { level: 2, title: "Lehrling",        xpRequired: 400,    icon: "🔨" },
  { level: 3, title: "Geselle",         xpRequired: 1500,   icon: "⚒️" },
  { level: 4, title: "Altgeselle",      xpRequired: 4000,   icon: "🛠️" },
  { level: 5, title: "Meisterschüler",  xpRequired: 8000,   icon: "📚" },
  { level: 6, title: "Jungmeister",     xpRequired: 16000,  icon: "🏆" },
  { level: 7, title: "Meister",         xpRequired: 28000,  icon: "👑" },
  { level: 8, title: "Obermeister",     xpRequired: 45000,  icon: "🌟" },
];

export function getLevel(xp: number): Level {
  return [...LEVELS].reverse().find((l) => xp >= l.xpRequired) ?? LEVELS[0];
}

export function getNextLevel(xp: number): Level | null {
  return LEVELS.find((l) => l.xpRequired > xp) ?? null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step",    title: "Erster Schritt",     description: "Erste Frage beantwortet",              icon: "🎯" },
  { id: "first-lesson",  title: "Tor geöffnet",       description: "Erste Lektion abgeschlossen",          icon: "📖" },
  { id: "ten-streak",    title: "Auf Kurs",           description: "10 Fragen in Folge richtig",           icon: "🔥" },
  { id: "perfect-session", title: "Perfektionist",    description: "Session ohne Fehler",                  icon: "💎" },
  { id: "week-streak",   title: "Streak-König",       description: "7 Tage am Stück gelernt",              icon: "👑" },
  { id: "hundred-club",  title: "100er Club",         description: "100 Fragen beantwortet",               icon: "💯" },
  { id: "probeklausur",  title: "Prüfung bestanden",  description: "Probeklausur ≥ 50 %",                  icon: "🎓" },
  { id: "night-owl",     title: "Nachtschicht",       description: "Nach 22 Uhr gelernt",                  icon: "🦉" },
  { id: "early-bird",    title: "Frühmeister",        description: "Vor 7 Uhr gelernt",                    icon: "🐓" },
];
