"use client";

/**
 * ClawbuisMark · Offizielles Logo als React-Component
 * 5 Claw Marks + Core Glow · Zunft-Farbverlauf Teal → Gold
 * Source of Truth: C:\Apps\CLAWBUIS\core\identity\brand\clawmark-logo.svg
 */

interface Props {
  className?: string;
  /** Mono = nur eine Farbe (für Footer etc), default = Gold/Teal-Gradient */
  mono?: boolean;
  ariaLabel?: string;
}

export function ClawbuisMark({ className = "h-5 w-5", mono = false, ariaLabel = "CLAWBUIS Logo" }: Props) {
  const gradientId = `clawGrad-${mono ? "mono" : "color"}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 76"
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        {mono ? (
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.65" />
          </linearGradient>
        ) : (
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="50%" stopColor="#d4b483" />
            <stop offset="100%" stopColor="#c29b62" />
          </linearGradient>
        )}
        <radialGradient id={`core-${mono ? "m" : "c"}`}>
          <stop offset="0%" stopColor={mono ? "currentColor" : "#ffd700"} stopOpacity="0.7" />
          <stop offset="100%" stopColor={mono ? "currentColor" : "#c29b62"} stopOpacity="0" />
        </radialGradient>
        <filter id={`blur-${mono ? "m" : "c"}`}>
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* 5 Claw Marks */}
      <g fill="none" stroke={`url(#${gradientId})`} strokeLinecap="round">
        <path d="M 20 52 C 16 44, 9 34, 7 24 C 5 16, 7 10, 11 10" strokeWidth="2.2" />
        <path d="M 23 46 C 21 36, 18 22, 19 12 C 20 6, 22 2, 25 4" strokeWidth="2.4" />
        <path d="M 30 44 C 29 32, 30 18, 32 6 C 33 1, 35 0, 36 3" strokeWidth="2.6" />
        <path d="M 38 46 C 40 36, 43 22, 44 12 C 45 6, 43 2, 40 4" strokeWidth="2.4" />
        <path d="M 44 52 C 48 44, 55 34, 57 24 C 59 16, 57 12, 53 12" strokeWidth="2" />
      </g>

      {/* Base arc */}
      <path
        d="M 18 54 C 20 60, 26 64, 32 64 C 38 64, 44 60, 46 54"
        fill="none"
        stroke={mono ? "currentColor" : "#c29b62"}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Core glow */}
      <circle cx="32" cy="50" r="8" fill={`url(#core-${mono ? "m" : "c"})`} filter={`url(#blur-${mono ? "m" : "c"})`} opacity="0.6" />
      <circle cx="32" cy="50" r="2.8" fill={mono ? "currentColor" : "#ffd700"} opacity="0.85" />
      <circle cx="32" cy="50" r="1.2" fill={mono ? "currentColor" : "#fffde8"} opacity="0.9" />
    </svg>
  );
}
