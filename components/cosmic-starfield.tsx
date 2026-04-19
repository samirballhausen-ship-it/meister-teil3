"use client";

/**
 * CosmicStarfield · Canvas2D-Starfield
 *
 * Zwei Modi:
 *  - "idle":       Sterne driften langsam, wenige, tief/dunkel
 *  - "hyperspace": Sterne fliegen radial aus dem Zentrum, beschleunigend
 *
 * Wird sowohl im Footer (idle) als auch im Portal-Transition (hyperspace) benutzt.
 */

import { useEffect, useRef } from "react";

interface Props {
  mode?: "idle" | "hover" | "hyperspace";
  density?: "low" | "medium" | "high";
  className?: string;
  /** Sichtbare Trails (Lichtgeschwindigkeit) nur im hyperspace-Modus */
  trails?: boolean;
}

interface Star {
  x: number; y: number;
  vx: number; vy: number;
  z: number;       // Tiefe 0 = weit weg, 1 = nah
  size: number;
  hue: number;     // 0 = gold, 180 = teal (approx)
  alpha: number;
  prevX?: number;
  prevY?: number;
}

export function CosmicStarfield({ mode = "idle", density = "medium", className = "", trails = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, cx = 0, cy = 0;
    function resize() {
      if (!c) return;
      const rect = c.parentElement!.getBoundingClientRect();
      w = rect.width; h = rect.height;
      cx = w / 2; cy = h / 2;
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = `${w}px`; c.style.height = `${h}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    if (c.parentElement) ro.observe(c.parentElement);

    const countMap = { low: 80, medium: 140, high: 240 };
    const count = reduce ? 20 : countMap[density];
    const stars: Star[] = [];

    for (let i = 0; i < count; i++) {
      stars.push(makeStar(cx, cy, w, h, false));
    }

    let raf = 0;

    function tick() {
      if (!c || !ctx) return;
      const m = modeRef.current;

      // Trail-Fade-Hintergrund: im Hyperspace Sterne hinterlassen Spuren
      if (m === "hyperspace" && trails) {
        ctx.fillStyle = "rgba(10, 10, 15, 0.25)";
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.prevX = s.x; s.prevY = s.y;

        if (m === "idle") {
          s.x += s.vx * 0.3;
          s.y += s.vy * 0.3;
          s.alpha = 0.25 + s.z * 0.65;
        } else if (m === "hover") {
          // Partikel bewegen sich Richtung Zentrum mit leichter Beschleunigung
          const dx = cx - s.x;
          const dy = cy - s.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const force = 0.002 + s.z * 0.01;
          s.vx += dx * force / Math.max(dist, 1);
          s.vy += dy * force / Math.max(dist, 1);
          s.vx *= 0.985; s.vy *= 0.985;
          s.x += s.vx;
          s.y += s.vy;
          s.alpha = 0.4 + s.z * 0.55;
          // Reset wenn zu nah
          if (dist < 20) Object.assign(s, makeStar(cx, cy, w, h, false));
        } else {
          // Hyperspace · Sterne fliegen radial weg vom Zentrum mit Beschleunigung
          const dx = s.x - cx;
          const dy = s.y - cy;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const speed = 0.5 + s.z * (8 + dist * 0.02);
          s.vx = (dx / Math.max(dist, 1)) * speed;
          s.vy = (dy / Math.max(dist, 1)) * speed;
          s.x += s.vx;
          s.y += s.vy;
          s.alpha = Math.min(1, 0.3 + s.z + dist * 0.002);
          // Respawn in Zentrum
          if (s.x < -10 || s.x > w + 10 || s.y < -10 || s.y > h + 10) {
            Object.assign(s, makeStar(cx, cy, w, h, true));
          }
        }

        // Wrap bei idle
        if (m === "idle") {
          if (s.x < 0) s.x = w; else if (s.x > w) s.x = 0;
          if (s.y < 0) s.y = h; else if (s.y > h) s.y = 0;
        }

        // Zeichnen
        const sz = s.size * (0.4 + s.z);
        const color = s.hue < 90 ? `194, 155, 98` : `45, 212, 191`;

        // Trail im Hyperspace
        if (m === "hyperspace" && trails && s.prevX !== undefined) {
          ctx.strokeStyle = `rgba(${color}, ${s.alpha})`;
          ctx.lineWidth = sz * 0.8;
          ctx.beginPath();
          ctx.moveTo(s.prevX, s.prevY);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        }

        // Punkt
        ctx.fillStyle = `rgba(${color}, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, sz, 0, Math.PI * 2);
        ctx.fill();

        // Glow für helle Sterne
        if (s.z > 0.7) {
          ctx.fillStyle = `rgba(${color}, ${s.alpha * 0.2})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, sz * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [density, trails]);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />;
}

function makeStar(cx: number, cy: number, w: number, h: number, fromCenter: boolean): Star {
  const hue = Math.random() < 0.7 ? 75 : 180; // meist gold, manchmal teal
  return {
    x: fromCenter ? cx + (Math.random() - 0.5) * 10 : Math.random() * w,
    y: fromCenter ? cy + (Math.random() - 0.5) * 10 : Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    z: Math.random(),
    size: 0.4 + Math.random() * 1.6,
    hue,
    alpha: 0,
  };
}
