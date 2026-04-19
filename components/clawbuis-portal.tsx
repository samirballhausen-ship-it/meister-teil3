"use client";

/**
 * ClawbuisPortal · Spektakuläres Quantum-Emergence-Portal
 *
 * Footer-Badge = "Cosmic Window":
 *  - Idle:        tiefer Kosmos · driftende Sterne · Clawmark-Fragment flackert
 *  - Hover/Touch: Sterne kollabieren zum Zentrum · Clawmark emergiert aus Quanten-Linien · pulsierende Ring-Energie
 *  - Click:       PortalTransition Full-Screen (Hyperspace · Clawmark · Shockwave · Redirect)
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CosmicStarfield } from "@/components/cosmic-starfield";
import { ClawbuisEmergence } from "@/components/clawbuis-emergence";
import { PortalTransition } from "@/components/portal-transition";
import { ExternalLink } from "lucide-react";

export function ClawbuisPortal() {
  const [hovering, setHovering] = useState(false);
  const [transition, setTransition] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setTransition(true);
  };

  const handleTransitionComplete = () => {
    window.open("https://clawbuis.com", "_blank", "noopener,noreferrer");
    setTimeout(() => setTransition(false), 400);
  };

  return (
    <>
      <motion.a
        href="https://clawbuis.com"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onTouchStart={() => setHovering(true)}
        onTouchEnd={() => setTimeout(() => setHovering(false), 700)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="group relative block my-6 rounded-2xl overflow-hidden cursor-pointer"
        style={{
          background: "linear-gradient(135deg, oklch(0.08 0.02 260) 0%, oklch(0.05 0.015 240) 100%)",
          border: "1px solid rgba(194,155,98,0.25)",
          boxShadow: hovering
            ? "0 0 40px rgba(194,155,98,0.35), inset 0 0 30px rgba(45,212,191,0.15)"
            : "0 0 20px rgba(194,155,98,0.1)",
          transition: "box-shadow 0.5s ease",
        }}
      >
        {/* Kosmos-Tiefe im Hintergrund */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          {/* Nebel-Blobs */}
          <motion.div
            className="absolute top-0 left-1/4 w-40 h-40 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #c29b62, transparent)", filter: "blur(30px)" }}
            animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, #2dd4bf, transparent)", filter: "blur(25px)" }}
            animate={{ x: [0, -15, 0], y: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        {/* Sternenfeld */}
        <div className="absolute inset-0 pointer-events-none">
          <CosmicStarfield mode={hovering ? "hover" : "idle"} density="medium" className="absolute inset-0 w-full h-full" />
        </div>

        {/* Quantum-Grid (tron-style Linien) */}
        <svg aria-hidden className="absolute inset-0 w-full h-full pointer-events-none opacity-40" preserveAspectRatio="none">
          <defs>
            <pattern id="quantumGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c29b62" strokeWidth="0.3" opacity="0.2" />
              <circle cx="0" cy="0" r="1" fill="#c29b62" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#quantumGrid)" />
        </svg>

        {/* Energie-Linien die zum Zentrum laufen (nur Hover) */}
        <AnimatePresence>
          {hovering && (
            <motion.svg
              aria-hidden
              className="absolute inset-0 w-full h-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              preserveAspectRatio="none"
              viewBox="0 0 400 100"
            >
              <defs>
                <linearGradient id="energyLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="#c29b62" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
              </defs>
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.line
                  key={i}
                  x1={20 + i * 10} y1={i * 15 + 10} x2="330" y2="50"
                  stroke="url(#energyLine)" strokeWidth="0.6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: [0, 1, 0] }}
                  transition={{ duration: 1.5, delay: i * 0.12, repeat: Infinity, repeatDelay: 0.3 }}
                />
              ))}
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Shimmer beim Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c29b62]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1800ms] pointer-events-none" />

        {/* Content */}
        <div className="relative p-4 flex items-center gap-3" style={{ perspective: "1000px" }}>
          {/* Clawmark-Emergence Window */}
          <motion.div
            animate={{ rotateY: hovering ? -10 : 0, translateZ: hovering ? 16 : 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-14 w-14 rounded-xl overflow-hidden shrink-0 relative"
            style={{
              background: "radial-gradient(circle, oklch(0.18 0.04 180 / 0.7) 0%, oklch(0.08 0.02 260) 80%)",
              border: "1px solid rgba(194,155,98,0.4)",
              transformStyle: "preserve-3d",
            }}
          >
            <ClawbuisEmergence active={hovering} />
          </motion.div>

          {/* Text */}
          <motion.div
            animate={{ translateZ: hovering ? 8 : 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 min-w-0 relative z-10"
          >
            <p className="gravur text-sm font-medium">
              <span className="text-gradient" style={{
                backgroundSize: hovering ? "200% 100%" : "100% 100%",
                backgroundPosition: hovering ? "right center" : "left center",
                transition: "background-position 1.5s ease"
              }}>CLAWBUIS</span>
            </p>
            <motion.p
              animate={{ opacity: hovering ? 1 : 0.7, letterSpacing: hovering ? "0.02em" : "0em" }}
              transition={{ duration: 0.4 }}
              className="text-[11px] italic text-[#c29b62]/80 mt-0.5 leading-tight"
            >
              you can just build things
            </motion.p>
          </motion.div>

          {/* Icon */}
          <motion.div
            animate={{
              x: hovering ? -6 : 0,
              rotate: hovering ? -12 : 0,
              scale: hovering ? 1.15 : 1,
              opacity: hovering ? 1 : 0.5,
            }}
            transition={{ duration: 0.4 }}
            className="relative z-10 shrink-0"
          >
            <ExternalLink className="h-4 w-4 text-[#c29b62]" />
          </motion.div>
        </div>

        {/* Vignette */}
        <div aria-hidden className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 85% 50%, transparent 20%, oklch(0.05 0.01 260 / 0.5) 100%)",
          }}
        />
      </motion.a>

      <AnimatePresence>
        {transition && <PortalTransition onComplete={handleTransitionComplete} />}
      </AnimatePresence>
    </>
  );
}
