"use client";

/**
 * PortalTransition · Full-Screen Hyperspace-Zoom-Through
 *
 * Choreografie (2000 ms total):
 *  0–300ms:    Die App blurred/zoomed out, dunkler Void übernimmt
 *  200–900ms:  Hyperspace Starfield beschleunigt · Sterne fliegen radial
 *  600–1200ms: Clawmark emergiert aus Zentrum · growing
 *  1000–1400ms: Metatron-Sacred-Geometry pulsiert um Clawmark
 *  1200–1600ms: Shockwave-Ring expandiert
 *  1500–1800ms: Weißer Flash
 *  1700–2000ms: Text Reveal "CLAWBUIS · you can just build things"
 *  2000ms: onComplete() → Redirect
 */

import { useEffect } from "react";
import { motion } from "motion/react";
import { CosmicStarfield } from "@/components/cosmic-starfield";
import { ClawbuisMark } from "@/components/clawbuis-mark";

interface Props {
  onComplete: () => void;
}

export function PortalTransition({ onComplete }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => onComplete(), 2000);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[200] overflow-hidden pointer-events-auto"
      style={{ background: "radial-gradient(ellipse at center, oklch(0.08 0.02 260) 0%, oklch(0.03 0.01 260) 100%)" }}
    >
      {/* App-Zoom-Out-Effect bleibt außerhalb, wir überlagern nur */}

      {/* Layer 1: Hyperspace Starfield */}
      <CosmicStarfield mode="hyperspace" density="high" trails className="absolute inset-0 w-full h-full" />

      {/* Layer 2: Nebel-Blobs */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 3, opacity: [0, 0.6, 0.3] }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(45,212,191,0.5), transparent 60%)", filter: "blur(40px)" }}
      />
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 2.5, opacity: [0, 0.7, 0.3] }}
        transition={{ duration: 1.5, delay: 0.15, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(194,155,98,0.6), transparent 55%)", filter: "blur(30px)" }}
      />

      {/* Layer 3: Metatron-Sacred-Geometry (rotierend) */}
      <motion.svg
        viewBox="-200 -200 400 400"
        className="absolute inset-0 w-full h-full pointer-events-none"
        initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
        animate={{ opacity: [0, 0.9, 0.9, 0], scale: [0.5, 1, 1.4, 2], rotate: 180 }}
        transition={{ duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: "drop-shadow(0 0 12px rgba(194,155,98,0.6))" }}
      >
        <defs>
          <linearGradient id="metatron-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c29b62" />
            <stop offset="50%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        {/* Flower of Life · 7 Kreise */}
        <circle cx="0" cy="0" r="50" fill="none" stroke="url(#metatron-grad)" strokeWidth="1.2" opacity="0.85" />
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (Math.PI / 3) * i;
          const x = Math.cos(a) * 50;
          const y = Math.sin(a) * 50;
          return <circle key={i} cx={x} cy={y} r="50" fill="none" stroke="url(#metatron-grad)" strokeWidth="0.9" opacity="0.6" />;
        })}
        {/* Outer Hexagon */}
        <polygon
          points={Array.from({ length: 6 }).map((_, i) => {
            const a = (Math.PI / 3) * i;
            return `${Math.cos(a) * 100},${Math.sin(a) * 100}`;
          }).join(" ")}
          fill="none" stroke="url(#metatron-grad)" strokeWidth="1.5"
        />
        {/* Inner connections */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a1 = (Math.PI / 3) * i;
          const a2 = (Math.PI / 3) * ((i + 2) % 6);
          return (
            <line key={i}
              x1={Math.cos(a1) * 100} y1={Math.sin(a1) * 100}
              x2={Math.cos(a2) * 100} y2={Math.sin(a2) * 100}
              stroke="url(#metatron-grad)" strokeWidth="0.8" opacity="0.7"
            />
          );
        })}
      </motion.svg>

      {/* Layer 4: Clawmark emerges massiv */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -90 }}
        animate={{
          scale: [0, 1.3, 1, 0.85],
          opacity: [0, 1, 1, 0.9],
          rotate: [-90, 0, 0, 0],
        }}
        transition={{
          duration: 1.6,
          delay: 0.5,
          times: [0, 0.3, 0.7, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ filter: "drop-shadow(0 0 40px rgba(194,155,98,0.8))" }}
      >
        <ClawbuisMark className="h-40 w-40 md:h-56 md:w-56" />
      </motion.div>

      {/* Layer 5: Expanding Shockwave-Ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 0, 5], opacity: [0, 0, 1, 0] }}
        transition={{ duration: 2, delay: 1, times: [0, 0.5, 0.75, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 pointer-events-none"
        style={{
          borderColor: "#c29b62",
          boxShadow: "0 0 40px rgba(194,155,98,0.7), inset 0 0 20px rgba(255,215,0,0.5)",
        }}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 0, 7], opacity: [0, 0, 0.8, 0] }}
        transition={{ duration: 2, delay: 1.15, times: [0, 0.5, 0.75, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border pointer-events-none"
        style={{ borderColor: "#2dd4bf", boxShadow: "0 0 30px rgba(45,212,191,0.6)" }}
      />

      {/* Layer 6: White Flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.85, 0] }}
        transition={{ duration: 0.6, delay: 1.4, times: [0, 0.4, 0.6, 1] }}
        className="absolute inset-0 bg-white pointer-events-none"
      />

      {/* Layer 7: Text Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: [0, 0, 1, 1], y: [30, 30, 0, -20] }}
        transition={{ duration: 1.2, delay: 1.2, times: [0, 0.4, 0.65, 1] }}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
      >
        <p className="text-[11px] uppercase tracking-[0.5em] text-[#c29b62] mb-3">Portal · Dimension aktiv</p>
        <h1 className="gravur text-5xl md:text-8xl font-medium leading-none text-gradient tracking-tight">
          CLAWBUIS
        </h1>
        <p className="mt-3 text-sm md:text-base italic text-[#c29b62]/90">
          you can just build things
        </p>
      </motion.div>

      {/* Layer 8: Radial Zoom-Lines (speedlines) */}
      <svg aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-50 -50 100 100">
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / 24;
          const x2 = Math.cos(angle) * 60;
          const y2 = Math.sin(angle) * 60;
          return (
            <motion.line
              key={i}
              x1="0" y1="0" x2={x2} y2={y2}
              stroke="#c29b62"
              strokeWidth="0.15"
              strokeLinecap="round"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: [0, 0.8, 0], pathLength: [0, 1, 1] }}
              transition={{ duration: 1.2, delay: 0.5 + i * 0.02, ease: "easeOut" }}
            />
          );
        })}
      </svg>
    </motion.div>
  );
}
