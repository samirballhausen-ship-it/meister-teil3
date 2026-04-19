"use client";

import type { ReactNode } from "react";

/**
 * ProgressRing · SVG-Kreis-Progress (0-100 %)
 * Wie Teil-4-Lernapp, mit unserer Emerald-Palette.
 */

interface Props {
  progress: number;
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
  color?: string;
  trackColor?: string;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 7,
  children,
  color = "var(--primary)",
  trackColor = "var(--muted)",
  className = "",
}: Props) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={trackColor} strokeWidth={strokeWidth} opacity="0.3"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
            filter: `drop-shadow(0 0 4px ${color}80)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
