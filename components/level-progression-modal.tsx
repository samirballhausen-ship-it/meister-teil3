"use client";

/**
 * LevelProgressionModal · Overlay das alle 8 Levels als Meister-Weg zeigt
 * Aktuelles Level fett hervorgehoben, erreichte mit Check, kommende ausgegraut.
 */

import { motion, AnimatePresence } from "motion/react";
import { LevelEmblem, LEVEL_DETAILS } from "@/components/level-emblem";
import { X, Lock, Check, Sparkles } from "lucide-react";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  currentXp: number;
  currentLevel: number;
}

export function LevelProgressionModal({ open, onClose, currentXp, currentLevel }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-start md:items-center justify-center p-0 md:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-card border border-border/50 md:rounded-2xl shadow-2xl overflow-hidden my-0 md:my-8"
          >
            {/* Header */}
            <div className="relative border-b border-border/50 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Deine Meister-Progression</p>
                <h2 className="gravur text-xl font-medium mt-0.5">Der Weg zum Meisterbrief</h2>
              </div>
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center transition-colors"
                aria-label="Schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Level-Pfad */}
            <div className="px-5 py-6 space-y-3">
              {LEVEL_DETAILS.map((l, i) => {
                const achieved = currentXp >= l.xpRequired;
                const active = l.level === currentLevel;
                const next = LEVEL_DETAILS[i + 1];
                const pctToNext = active && next
                  ? ((currentXp - l.xpRequired) / (next.xpRequired - l.xpRequired)) * 100
                  : 100;

                return (
                  <motion.div
                    key={l.level}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`relative rounded-xl border p-4 transition-all ${
                      active
                        ? "border-accent/60 bg-gradient-to-br from-accent/15 via-card to-primary/8 shadow-lg shadow-accent/20"
                        : achieved
                          ? "border-success/30 bg-success/5"
                          : "border-border/40 bg-card/30 opacity-60"
                    }`}
                  >
                    {/* Connector-Linie zum nächsten */}
                    {i < LEVEL_DETAILS.length - 1 && (
                      <div
                        className="absolute left-[52px] top-full h-3 w-0.5 -translate-x-1/2"
                        style={{
                          background: achieved ? "var(--success)" : "oklch(1 0 0 / 0.1)",
                        }}
                      />
                    )}

                    <div className="flex items-center gap-4">
                      <div className="shrink-0 relative">
                        <LevelEmblem
                          level={l.level}
                          active={active}
                          achieved={achieved}
                          size={56}
                        />
                        {achieved && !active && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success flex items-center justify-center border-2 border-background">
                            <Check className="h-3 w-3 text-background" />
                          </div>
                        )}
                        {!achieved && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                            <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`gravur text-base font-medium ${active ? "text-accent" : achieved ? "text-foreground" : "text-muted-foreground"}`}>
                            {l.title}
                          </h3>
                          {active && (
                            <span className="text-[9px] uppercase tracking-[0.25em] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-semibold">
                              Du bist hier
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{l.description}</p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-mono">
                          <span className={achieved ? "text-success" : "text-muted-foreground"}>
                            {l.xpRequired.toLocaleString("de-DE")} XP
                          </span>
                          {next && active && (
                            <>
                              <span className="text-muted-foreground/60">·</span>
                              <span className="text-accent">
                                {(next.xpRequired - currentXp).toLocaleString("de-DE")} XP bis {next.title}
                              </span>
                            </>
                          )}
                        </div>
                        {active && next && (
                          <div className="mt-2 h-1 rounded-full bg-muted/40 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-primary to-accent"
                              initial={{ width: 0 }}
                              animate={{ width: `${pctToNext}%` }}
                              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border/50 bg-muted/20 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-accent" />
              <span>Jede richtig beantwortete Frage bringt XP. Lektionen geben +40 XP.</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
