"use client";

/**
 * ClawbuisEmergence · Clawmark im Footer-Portal
 *
 * Idle:   alle 5 Claws voll gezeichnet (einmal, bleibt stehen), Core leuchtet sanft.
 * Active: zusätzliche Partikel-Aura, Base-Arc erscheint, Core pulsiert stärker.
 *
 * Grund: Samir will NICHT dass das Logo flackert/verschwindet.
 *        Einmal auftauchen → bleiben → bei Hover extra-Glanz.
 */

import { motion } from "motion/react";

interface Props {
  active?: boolean;
}

const CLAWS = [
  { d: "M 20 52 C 16 44, 9 34, 7 24 C 5 16, 7 10, 11 10", width: 2.2 },
  { d: "M 23 46 C 21 36, 18 22, 19 12 C 20 6, 22 2, 25 4",  width: 2.4 },
  { d: "M 30 44 C 29 32, 30 18, 32 6 C 33 1, 35 0, 36 3",   width: 2.6 },
  { d: "M 38 46 C 40 36, 43 22, 44 12 C 45 6, 43 2, 40 4",  width: 2.4 },
  { d: "M 44 52 C 48 44, 55 34, 57 24 C 59 16, 57 12, 53 12", width: 2 },
];

export function ClawbuisEmergence({ active = false }: Props) {
  return (
    <svg viewBox="0 0 64 76" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="emerge-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="50%" stopColor="#d4b483" />
          <stop offset="100%" stopColor="#c29b62" />
        </linearGradient>
        <radialGradient id="emerge-core">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#c29b62" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c29b62" stopOpacity="0" />
        </radialGradient>
        <filter id="emerge-glow">
          <feGaussianBlur stdDeviation="1.6" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Core-Glow · immer da. Leichte Pulsation, bei active stärker. */}
      <motion.circle
        cx="32" cy="50"
        fill="url(#emerge-core)"
        filter="url(#emerge-glow)"
        animate={{
          r: active ? [9, 13, 9] : [7, 9, 7],
          opacity: active ? [0.85, 1, 0.85] : [0.55, 0.75, 0.55],
        }}
        transition={{ duration: active ? 1.6 : 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 5 Claws · einmal auftauchen, dann bleiben. Bei active leuchten sie heller. */}
      {CLAWS.map((claw, i) => (
        <motion.path
          key={i}
          d={claw.d}
          fill="none"
          stroke="url(#emerge-grad)"
          strokeWidth={claw.width}
          strokeLinecap="round"
          filter="url(#emerge-glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: active ? 1 : 0.82,
          }}
          transition={{
            pathLength: { duration: 1.0, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] },
            opacity:    { duration: 0.5, delay: 0.1 + i * 0.09 },
          }}
        />
      ))}

      {/* Base Arc · Fundament. Bei idle dezent, bei active kräftig. */}
      <motion.path
        d="M 18 54 C 20 60, 26 64, 32 64 C 38 64, 44 60, 46 54"
        fill="none"
        stroke="#c29b62"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: active ? 0.75 : 0.35 }}
        transition={{ pathLength: { duration: 0.6, delay: 0.6 }, opacity: { duration: 0.4 } }}
      />

      {/* Core Dots · immer da */}
      <circle cx="32" cy="50" r="2.8" fill="#ffd700" opacity="0.9" />
      <motion.circle
        cx="32" cy="50" r="1.2"
        fill="#fffde8"
        animate={{ opacity: active ? [0.9, 1, 0.9] : [0.7, 0.95, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Partikel-Aura · NUR bei active */}
      {active && Array.from({ length: 8 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 8;
        const r1 = 22;
        const r2 = 32;
        return (
          <motion.circle
            key={`p-${i}`}
            cx={32 + Math.cos(angle) * r1}
            cy={50 + Math.sin(angle) * r1}
            r="0.8"
            fill="#c29b62"
            filter="url(#emerge-glow)"
            animate={{
              cx: [32 + Math.cos(angle) * r1, 32 + Math.cos(angle) * r2, 32 + Math.cos(angle) * r1],
              cy: [50 + Math.sin(angle) * r1, 50 + Math.sin(angle) * r2, 50 + Math.sin(angle) * r1],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1.8, delay: i * 0.15, repeat: Infinity, repeatDelay: 0.2 }}
          />
        );
      })}
    </svg>
  );
}
