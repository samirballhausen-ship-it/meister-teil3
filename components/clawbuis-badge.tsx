"use client";

/**
 * CLAWBUIS-Badge-Exports
 * Portal (voll magisch) für Footer
 * Compact (klein) für Inline-Einbau
 * Credit (dezent) für Result-Screens
 */

import { ClawbuisMark } from "@/components/clawbuis-mark";
import { ClawbuisPortal } from "@/components/clawbuis-portal";
import { motion } from "motion/react";

export { ClawbuisPortal as ClawbuisFooter };

export function ClawbuisCompact({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://clawbuis.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-muted-foreground/70 hover:text-[#c29b62] transition-colors group ${className}`}
    >
      <ClawbuisMark className="h-3 w-3 group-hover:scale-110 transition-transform" mono />
      <span className="text-[9px] uppercase tracking-[0.25em] font-medium">CLAWBUIS</span>
      <span className="text-[9px] italic text-muted-foreground/50">build things</span>
    </a>
  );
}

export function ClawbuisCredit() {
  return (
    <motion.a
      href="https://clawbuis.com"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-center gap-2 pt-4 text-[10px] text-muted-foreground/75 hover:text-[#c29b62] transition-colors group"
    >
      <ClawbuisMark className="h-3.5 w-3.5 group-hover:animate-pulse" />
      <span className="uppercase tracking-[0.25em]">
        Geschmiedet im <strong className="text-foreground/90 text-gradient">CLAWBUIS</strong>·Atelier
      </span>
    </motion.a>
  );
}

export function ClawbuisCornerMark({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://clawbuis.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`absolute top-2 right-2 opacity-30 hover:opacity-80 transition-opacity ${className}`}
      aria-label="CLAWBUIS"
    >
      <ClawbuisMark className="h-4 w-4" />
    </a>
  );
}
