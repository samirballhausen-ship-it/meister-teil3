"use client";

import { useEffect, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
}

export function AnimatedCounter({ value, duration = 900, decimals = 0 }: Props) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const start = performance.now();
    const from = v;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(from + (value - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{v.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}
