"use client";

/**
 * LevelEmblem · 8 Custom-SVG-Siegel für die Meister-Progression
 * Keine Emojis. Edles gesticheltes Pergament-Siegel pro Level.
 *
 * Jedes Emblem hat:
 *  - Gold-Teal-Gradient Stroke
 *  - Holo-Shimmer bei aktiv
 *  - Radialen Glow
 *  - Spezifische Symbolik passend zum Rang
 */

import type { ReactNode } from "react";

export type LevelKey =
  | "pruefling" | "lehrling" | "geselle" | "altgeselle"
  | "meisterschueler" | "jungmeister" | "meister" | "obermeister";

const LEVEL_MAP: Record<number, LevelKey> = {
  1: "pruefling", 2: "lehrling", 3: "geselle", 4: "altgeselle",
  5: "meisterschueler", 6: "jungmeister", 7: "meister", 8: "obermeister",
};

interface Props {
  level: number;          // 1-8
  active?: boolean;       // aktuelles Level (max glow, shimmer)
  achieved?: boolean;     // erreicht (stroke in color, kein shimmer)
  size?: number;
  className?: string;
}

export function LevelEmblem({ level, active = false, achieved = true, size = 64, className = "" }: Props) {
  const key = LEVEL_MAP[level] ?? "pruefling";
  const id = `lvl-${key}-${active ? "on" : achieved ? "ach" : "off"}`;
  const goldA = achieved ? "#f5d896" : "#555";
  const goldB = achieved ? "#c29b62" : "#333";
  const accent = achieved ? "#2dd4bf" : "#444";
  const glowOpacity = active ? 1 : achieved ? 0.6 : 0.2;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background Glow (nur active) */}
      {active && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-full animate-pulse-amber"
          style={{
            background: "radial-gradient(circle, rgba(194,155,98,0.4) 0%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      )}

      <svg viewBox="0 0 80 80" width={size} height={size} className="relative">
        <defs>
          <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor={goldA} />
            <stop offset="50%" stopColor={accent} />
            <stop offset="100%" stopColor={goldB} />
          </linearGradient>
          <radialGradient id={`${id}-core`}>
            <stop offset="0%" stopColor="#ffd700" stopOpacity={glowOpacity * 0.6} />
            <stop offset="100%" stopColor="#c29b62" stopOpacity="0" />
          </radialGradient>
          {active && (
            <linearGradient id={`${id}-shimmer`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#ffd700" stopOpacity="0">
                <animate attributeName="offset" values="0;1" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="25%"  stopColor="#ffd700" stopOpacity="0.5">
                <animate attributeName="offset" values="0.25;1.25" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%"  stopColor="#ffd700" stopOpacity="0">
                <animate attributeName="offset" values="0.5;1.5" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          )}
        </defs>

        {/* Medallion-Ring (äußere Kante) */}
        <circle
          cx="40" cy="40" r="36"
          fill="none"
          stroke={`url(#${id}-grad)`}
          strokeWidth={active ? "1.8" : achieved ? "1.3" : "0.8"}
          opacity={achieved ? 1 : 0.5}
        />
        <circle
          cx="40" cy="40" r="32"
          fill={`url(#${id}-core)`}
          stroke={`url(#${id}-grad)`}
          strokeWidth="0.5"
          opacity={achieved ? 0.9 : 0.4}
        />

        {/* Zunft-Kartusche · dekorative Punkte */}
        {[0, 90, 180, 270].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 40 + Math.cos(rad) * 34;
          const cy = 40 + Math.sin(rad) * 34;
          return <circle key={deg} cx={cx} cy={cy} r="1.4" fill={`url(#${id}-grad)`} opacity={achieved ? 1 : 0.4} />;
        })}

        {/* Symbol pro Level */}
        {key === "pruefling" && <SymbolPruefling id={id} />}
        {key === "lehrling" && <SymbolLehrling id={id} />}
        {key === "geselle" && <SymbolGeselle id={id} />}
        {key === "altgeselle" && <SymbolAltgeselle id={id} />}
        {key === "meisterschueler" && <SymbolMeisterschueler id={id} />}
        {key === "jungmeister" && <SymbolJungmeister id={id} />}
        {key === "meister" && <SymbolMeister id={id} />}
        {key === "obermeister" && <SymbolObermeister id={id} />}

        {/* Holo-Shimmer Overlay · nur active */}
        {active && (
          <circle
            cx="40" cy="40" r="32"
            fill={`url(#${id}-shimmer)`}
            opacity="0.5"
            style={{ mixBlendMode: "overlay" }}
          />
        )}
      </svg>
    </div>
  );
}

// ─── Symbole pro Level ──────────────────────────────────────────

// 1 · Prüfling · Pergament-Rolle mit Siegel
function SymbolPruefling({ id }: { id: string }) {
  return (
    <g stroke={`url(#${id}-grad)`} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 26 24 Q 22 24 22 28 L 22 50 Q 22 54 26 54 L 54 54 Q 58 54 58 50 L 58 28 Q 58 24 54 24 Z" />
      <line x1="28" y1="32" x2="50" y2="32" opacity="0.6" />
      <line x1="28" y1="38" x2="52" y2="38" opacity="0.6" />
      <line x1="28" y1="44" x2="46" y2="44" opacity="0.6" />
      <circle cx="58" cy="50" r="4" fill={`url(#${id}-grad)`} opacity="0.7" />
    </g>
  );
}

// 2 · Lehrling · Hammer + Amboss
function SymbolLehrling({ id }: { id: string }) {
  return (
    <g stroke={`url(#${id}-grad)`} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Amboss */}
      <path d="M 24 54 L 56 54 L 52 58 L 28 58 Z" fill={`url(#${id}-grad)`} opacity="0.4" />
      <path d="M 30 54 L 30 48 L 50 48 L 50 54" />
      <path d="M 34 48 L 34 42 L 46 42 L 46 48" />
      {/* Hammer schräg */}
      <line x1="32" y1="28" x2="48" y2="22" strokeWidth="2.2" />
      <rect x="44" y="18" width="10" height="8" rx="1.5" fill={`url(#${id}-grad)`} opacity="0.7" transform="rotate(-20, 49, 22)" />
    </g>
  );
}

// 3 · Geselle · Werkzeugkasten
function SymbolGeselle({ id }: { id: string }) {
  return (
    <g stroke={`url(#${id}-grad)`} strokeWidth="1.5" fill="none" strokeLinejoin="round">
      <path d="M 30 30 L 30 26 Q 30 24 32 24 L 48 24 Q 50 24 50 26 L 50 30" />
      <rect x="24" y="30" width="32" height="22" rx="2" fill={`url(#${id}-grad)`} opacity="0.15" />
      <line x1="40" y1="30" x2="40" y2="52" opacity="0.5" />
      <line x1="24" y1="38" x2="56" y2="38" opacity="0.5" />
      <circle cx="40" cy="38" r="2" fill={`url(#${id}-grad)`} opacity="0.9" />
    </g>
  );
}

// 4 · Altgeselle · Doppelhammer mit Lorbeer
function SymbolAltgeselle({ id }: { id: string }) {
  return (
    <g stroke={`url(#${id}-grad)`} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Hammer 1 */}
      <line x1="32" y1="50" x2="32" y2="28" strokeWidth="2" />
      <rect x="26" y="24" width="12" height="7" rx="1.5" fill={`url(#${id}-grad)`} opacity="0.6" />
      {/* Hammer 2 */}
      <line x1="48" y1="50" x2="48" y2="28" strokeWidth="2" />
      <rect x="42" y="24" width="12" height="7" rx="1.5" fill={`url(#${id}-grad)`} opacity="0.6" />
      {/* Lorbeer */}
      <path d="M 22 52 Q 28 56 40 56 Q 52 56 58 52" />
      {Array.from({ length: 5 }).map((_, i) => (
        <circle key={i} cx={26 + i * 7} cy={54} r="1.2" fill={`url(#${id}-grad)`} opacity="0.7" />
      ))}
    </g>
  );
}

// 5 · Meisterschüler · Buch mit Siegel
function SymbolMeisterschueler({ id }: { id: string }) {
  return (
    <g stroke={`url(#${id}-grad)`} strokeWidth="1.4" fill="none" strokeLinejoin="round">
      <path d="M 22 28 L 22 54 Q 22 56 24 56 L 40 54 L 56 56 Q 58 56 58 54 L 58 28 Q 56 26 40 28 Q 24 26 22 28 Z" fill={`url(#${id}-grad)`} opacity="0.15" />
      <line x1="40" y1="28" x2="40" y2="54" strokeWidth="1.2" />
      <line x1="28" y1="36" x2="36" y2="36" opacity="0.5" />
      <line x1="28" y1="42" x2="36" y2="42" opacity="0.5" />
      <line x1="44" y1="36" x2="52" y2="36" opacity="0.5" />
      <line x1="44" y1="42" x2="52" y2="42" opacity="0.5" />
      {/* Siegel oben rechts */}
      <circle cx="54" cy="28" r="4" fill="#c29b62" opacity="0.85" />
    </g>
  );
}

// 6 · Jungmeister · Meisterstück mit Stempel
function SymbolJungmeister({ id }: { id: string }) {
  return (
    <g stroke={`url(#${id}-grad)`} strokeWidth="1.5" fill="none" strokeLinejoin="round">
      {/* Pergament */}
      <path d="M 24 22 L 56 22 L 56 58 L 24 58 Z" fill={`url(#${id}-grad)`} opacity="0.1" />
      <line x1="28" y1="30" x2="50" y2="30" opacity="0.5" />
      <line x1="28" y1="35" x2="52" y2="35" opacity="0.5" />
      <line x1="28" y1="40" x2="48" y2="40" opacity="0.5" />
      {/* Großes Siegel in der Mitte */}
      <circle cx="40" cy="52" r="6" fill="#c29b62" opacity="0.9" />
      <path d="M 37 52 L 39 54 L 43 50" stroke="#1a1a1f" strokeWidth="1.4" fill="none" />
    </g>
  );
}

// 7 · Meister · Krone + Hammer
function SymbolMeister({ id }: { id: string }) {
  return (
    <g stroke={`url(#${id}-grad)`} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Krone */}
      <path d="M 20 34 L 26 22 L 32 30 L 40 20 L 48 30 L 54 22 L 60 34 L 56 40 L 24 40 Z" fill={`url(#${id}-grad)`} opacity="0.5" />
      {/* Juwelen */}
      <circle cx="26" cy="22" r="1.4" fill="#ffd700" />
      <circle cx="40" cy="20" r="1.8" fill="#ffd700" />
      <circle cx="54" cy="22" r="1.4" fill="#ffd700" />
      {/* Hammer im Zentrum der Krone */}
      <line x1="40" y1="40" x2="40" y2="56" strokeWidth="2" />
      <rect x="32" y="44" width="16" height="8" rx="1.5" fill={`url(#${id}-grad)`} opacity="0.8" />
    </g>
  );
}

// 8 · Obermeister · Sternen-Krone mit Zunft-Zeichen
function SymbolObermeister({ id }: { id: string }) {
  return (
    <g stroke={`url(#${id}-grad)`} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Sterne-Krone */}
      {[[40, 18], [28, 24], [52, 24], [20, 34], [60, 34]].map(([x, y], i) => (
        <g key={i}>
          <path d={`M ${x} ${y-3} L ${x+1} ${y-1} L ${x+3} ${y} L ${x+1} ${y+1} L ${x} ${y+3} L ${x-1} ${y+1} L ${x-3} ${y} L ${x-1} ${y-1} Z`}
                fill={`url(#${id}-grad)`} opacity="0.9" />
        </g>
      ))}
      {/* Zunft-Zentrum */}
      <circle cx="40" cy="46" r="10" fill={`url(#${id}-grad)`} opacity="0.25" />
      <circle cx="40" cy="46" r="10" stroke={`url(#${id}-grad)`} strokeWidth="1.5" />
      {/* Meister-Monogram "M" */}
      <path d="M 34 50 L 34 42 L 40 48 L 46 42 L 46 50" strokeWidth="2" />
      {/* Untere Kartusche */}
      <path d="M 28 58 Q 40 62 52 58" opacity="0.6" />
    </g>
  );
}

// ─── Info-Export ────────────────────────────────────────────────

export interface LevelInfo {
  level: number;
  key: LevelKey;
  title: string;
  xpRequired: number;
  description: string;
}

export const LEVEL_DETAILS: LevelInfo[] = [
  { level: 1, key: "pruefling",       title: "Prüfling",        xpRequired: 0,     description: "Der Weg beginnt. Erste Fragen, erste Lektionen." },
  { level: 2, key: "lehrling",        title: "Lehrling",        xpRequired: 400,   description: "Grundlagen sitzen. Der Hammer findet seinen Rhythmus." },
  { level: 3, key: "geselle",         title: "Geselle",         xpRequired: 1500,  description: "Werkzeug im Griff. Die Werkstatt wird dein Zuhause." },
  { level: 4, key: "altgeselle",      title: "Altgeselle",      xpRequired: 4000,  description: "Erfahrung wächst. Erste Mitschüler schauen zu dir auf." },
  { level: 5, key: "meisterschueler", title: "Meisterschüler",  xpRequired: 8000,  description: "Die Prüfung rückt näher. Dein Wissen reift." },
  { level: 6, key: "jungmeister",     title: "Jungmeister",     xpRequired: 16000, description: "Das Meisterstück ist nah. Die Zunft erkennt dich an." },
  { level: 7, key: "meister",         title: "Meister",         xpRequired: 28000, description: "Die Krone sitzt. Dein Name steht in der Handwerksrolle." },
  { level: 8, key: "obermeister",     title: "Obermeister",     xpRequired: 45000, description: "Die höchste Stufe. Führer deiner Zunft." },
];
