"use client";

/**
 * AchievementBadge · edle Custom-SVG-Abzeichen mit Holo-Effekt
 * - Gewonnen: animierter Gradient-Stroke, Gold-Glow, subtle rotation
 * - Nicht gewonnen: monochrom-grau, dimmed, Outline-only
 * Designt wie Zunft-Orden/Medaillons. Kein Emoji.
 */

import { motion } from "motion/react";
import type { ReactNode } from "react";

export type AchievementIconKey =
  | "first-step" | "first-lesson" | "ten-streak" | "perfect-session"
  | "week-streak" | "hundred-club" | "probeklausur" | "night-owl" | "early-bird";

interface Props {
  id: AchievementIconKey;
  owned: boolean;
  title: string;
  description: string;
}

export function AchievementBadge({ id, owned, title, description }: Props) {
  return (
    <motion.div
      whileHover={owned ? { y: -2, scale: 1.03 } : {}}
      className={`relative rounded-2xl border p-3 text-center transition-all overflow-hidden ${
        owned
          ? "border-accent/50 bg-gradient-to-br from-accent/12 via-card/40 to-primary/8 shadow-lg shadow-accent/10"
          : "border-border/40 bg-card/20 opacity-40"
      }`}
    >
      {/* Holo-Shimmer-Layer (nur owned) */}
      {owned && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `linear-gradient(115deg, transparent 30%, rgba(194,155,98,0.3) 50%, transparent 70%)`,
            backgroundSize: "200% 200%",
            animation: "shimmer 4s ease-in-out infinite",
          }}
        />
      )}

      <div className="relative h-12 w-12 mx-auto mb-1.5">
        <BadgeSvg id={id} owned={owned} />
      </div>
      <p className={`text-[10px] font-semibold leading-tight ${owned ? "text-foreground" : "text-muted-foreground/70"}`}>
        {title}
      </p>
      {owned && (
        <p className="text-[9px] text-muted-foreground/70 mt-0.5 leading-tight line-clamp-2">
          {description}
        </p>
      )}
    </motion.div>
  );
}

// ─── SVG-Badge pro Achievement ──────────────────────────────────

function BadgeSvg({ id, owned }: { id: AchievementIconKey; owned: boolean }) {
  const gradId = `grad-${id}-${owned ? "on" : "off"}`;
  const goldStop1 = owned ? "#f5d896" : "#555";
  const goldStop2 = owned ? "#c29b62" : "#333";
  const accentColor = owned ? "#2dd4bf" : "#444";
  const glow = owned ? "url(#glow-on)" : "none";

  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={goldStop1} />
          <stop offset="50%" stopColor={accentColor} />
          <stop offset="100%" stopColor={goldStop2} />
        </linearGradient>
        {owned && (
          <filter id="glow-on">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        )}
      </defs>

      {/* Gemeinsamer Medaillon-Rahmen */}
      <circle cx="24" cy="24" r="21" fill="none" stroke={`url(#${gradId})`} strokeWidth={owned ? "1.5" : "1"} filter={glow} />
      <circle cx="24" cy="24" r="18" fill={owned ? "rgba(194,155,98,0.08)" : "transparent"} stroke={`url(#${gradId})`} strokeWidth="0.5" opacity="0.5" />

      {/* Spezifisches Symbol pro Achievement */}
      {id === "first-step" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M 16 30 L 20 20 L 24 30 L 28 16 L 32 26" />
          <circle cx="20" cy="20" r="1.5" fill={`url(#${gradId})`} />
        </g>
      )}
      {id === "first-lesson" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 14 16 L 14 32 L 24 30 L 34 32 L 34 16 L 24 14 Z" />
          <line x1="24" y1="14" x2="24" y2="30" />
        </g>
      )}
      {id === "ten-streak" && (
        <g>
          <path d="M 24 12 C 20 16 18 22 22 26 C 24 28 28 27 30 24 C 32 21 31 17 28 14 C 26 12 24 12 24 12 Z"
                fill={`url(#${gradId})`} filter={glow} opacity={owned ? "0.9" : "0.6"} />
          <circle cx="25" cy="22" r="2" fill={owned ? "#fffde8" : "#666"} opacity="0.8" />
        </g>
      )}
      {id === "perfect-session" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.6" fill="none" strokeLinejoin="round">
          <path d="M 24 12 L 30 20 L 36 22 L 32 28 L 33 36 L 24 32 L 15 36 L 16 28 L 12 22 L 18 20 Z"
                fill={owned ? "url(#" + gradId + ")" : "none"} opacity={owned ? "0.3" : "1"} />
          <path d="M 20 24 L 23 27 L 30 20" stroke={owned ? "#fffde8" : `url(#${gradId})`} strokeWidth="2" />
        </g>
      )}
      {id === "week-streak" && (
        <g>
          {Array.from({ length: 7 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 7 - Math.PI / 2;
            const x = 24 + Math.cos(angle) * 11;
            const y = 24 + Math.sin(angle) * 11;
            return <circle key={i} cx={x} cy={y} r={owned ? "1.8" : "1.2"} fill={`url(#${gradId})`} opacity={owned ? (0.5 + i * 0.07) : 0.5} />;
          })}
          <text x="24" y="28" textAnchor="middle" fontSize="10" fontWeight="700" fill={`url(#${gradId})`}>7</text>
        </g>
      )}
      {id === "hundred-club" && (
        <g>
          <text x="24" y="30" textAnchor="middle" fontSize="14" fontWeight="900" fontFamily="serif" fill={`url(#${gradId})`} filter={glow}>
            100
          </text>
        </g>
      )}
      {id === "probeklausur" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d="M 16 14 L 32 14 L 32 34 L 16 34 Z" fill={owned ? "rgba(194,155,98,0.1)" : "transparent"} />
          <path d="M 19 20 L 29 20 M 19 24 L 29 24 M 19 28 L 25 28" opacity="0.7" />
          {owned && (
            <circle cx="33" cy="13" r="5" fill={accentColor} opacity="0.9" />
          )}
          {owned && (
            <path d="M 31 13 L 33 15 L 35.5 11.5" stroke="#fffde8" strokeWidth="1.3" fill="none" />
          )}
        </g>
      )}
      {id === "night-owl" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.5" fill="none">
          <path d="M 32 16 C 32 20 30 24 24 24 C 30 24 34 26 34 32 C 30 30 26 30 24 32 C 22 30 18 30 14 32 C 14 26 18 24 24 24 C 18 24 16 20 16 16 C 20 18 24 18 24 18 C 24 18 28 18 32 16 Z"
                fill={owned ? `url(#${gradId})` : "none"} opacity={owned ? "0.5" : "1"} />
          <circle cx="20" cy="22" r="1.2" fill={owned ? "#fffde8" : accentColor} />
          <circle cx="28" cy="22" r="1.2" fill={owned ? "#fffde8" : accentColor} />
        </g>
      )}
      {id === "early-bird" && (
        <g stroke={`url(#${gradId})`} strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d="M 10 30 L 38 30" />
          <path d="M 24 22 C 20 22 17 25 17 28" />
          <path d="M 24 22 C 28 22 31 25 31 28" />
          <circle cx="24" cy="18" r="5" fill={owned ? `url(#${gradId})` : "none"} opacity={owned ? "0.3" : "1"} />
          {/* Sonnenstrahlen */}
          {[0, 60, 120, 180, 240, 300].map((a) => {
            const rad = (a * Math.PI) / 180;
            const x1 = 24 + Math.cos(rad) * 6;
            const y1 = 18 + Math.sin(rad) * 6;
            const x2 = 24 + Math.cos(rad) * 9;
            const y2 = 18 + Math.sin(rad) * 9;
            return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1.2" opacity="0.7" />;
          })}
        </g>
      )}
    </svg>
  );
}
