"use client";

/**
 * SessionRunner · adaptive Fragen-Session mit 4 Fragetypen
 * Wrapped FrageRunner und wählt via Algorithmus passende Fragen aus Pool.
 */

import { useEffect, useMemo, useState } from "react";
import { useProgress, selectAdaptive } from "@/lib/progress-context";
import type { Frage } from "@/lib/types";
import { FrageRunner } from "@/components/frage-runner";

interface Props {
  pool: Frage[];
  mode: string;
  count: number;
  timerSec?: number;
}

export function SessionRunner({ pool, mode, count, timerSec }: Props) {
  const { progress } = useProgress();
  const [picked, setPicked] = useState<Frage[] | null>(null);

  const selectedIds = useMemo(() => {
    const ids = pool.map((q) => q.id);
    const selMode =
      mode === "schwach" ? "schwach" :
      mode === "neu"     ? "neu" :
      mode === "spaced"  ? "spaced" :
                           "mix";
    return selectAdaptive(ids, progress, Math.min(count, pool.length), selMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, mode, count]);

  useEffect(() => {
    if (mode === "exam") {
      // Klausur: alle Fragen, stabil gemischt
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
      setPicked(shuffled);
    } else {
      setPicked(selectedIds.map((id) => pool.find((q) => q.id === id)!).filter(Boolean));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, mode, count]);

  if (!picked) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-muted-foreground animate-pulse">
        Fragen werden gewählt …
      </div>
    );
  }

  return <FrageRunner fragen={picked} mode={mode} timerSec={timerSec} />;
}
