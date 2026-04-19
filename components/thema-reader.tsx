"use client";

/**
 * ThemaReader · Mobile-first, visuell, wenig Text
 *
 * Verbesserungen gegenüber vorher:
 *  - Sticky Progress-Bar oben (scroll %)
 *  - Auto-TOC (Table of Contents) als Chip-Strip am Anfang, scrollt zu Sections
 *  - Collapsible Sections (tap zum aufklappen) für "tief eintauchen"
 *  - Kompakte mobile Typo
 *  - Shortcode-Rendering für Fakt/Formel/Merkkarte/Ablauf/Tipp/Trend
 */

import Link from "next/link";
import { motion, useScroll, useSpring } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState, useRef, Fragment, useMemo } from "react";
import { useProgress } from "@/lib/progress-context";
import { useProfile } from "@/lib/profile-store";
import { CLUSTERS, type Thema } from "@/lib/types";
import { parseShortcodes, type Segment } from "@/lib/content/mdx-shortcodes";
import { NavBar } from "@/components/nav-bar";
import { ClawbuisPortal } from "@/components/clawbuis-portal";
import { Fakt, Formel, Vergleich, Merkkarte, Ablauf, StatBar, BilanzT, Tipp, Trend } from "@/components/lern-visuals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Clock, Target, CheckCircle2, Sparkles, Trophy, ChevronDown, List } from "lucide-react";

interface Props { thema: Thema; fragenCount: number; }

interface TocEntry { id: string; title: string; }

export function ThemaReader({ thema, fragenCount }: Props) {
  const { recordLessonComplete, stats } = useProgress();
  const { profile } = useProfile();
  const cluster = CLUSTERS.find((c) => c.id === thema.frontmatter.cluster)!;
  const [marked, setMarked] = useState(false);
  const [xpBurst, setXpBurst] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const alreadyDone = stats.lessonsCompleted.includes(thema.frontmatter.slug);

  useEffect(() => {
    if (!profile) return;
    if (alreadyDone) { setMarked(true); return; }
    const timer = setTimeout(() => {
      recordLessonComplete(thema.frontmatter.slug);
      setMarked(true);
      setXpBurst(true);
      setTimeout(() => setXpBurst(false), 2500);
    }, 20000);
    return () => clearTimeout(timer);
  }, [profile, alreadyDone, recordLessonComplete, thema.frontmatter.slug]);

  const segments = useMemo(() => parseShortcodes(thema.body), [thema.body]);

  // TOC aus H2-Headlines extrahieren
  const toc: TocEntry[] = useMemo(() => {
    const entries: TocEntry[] = [];
    const lines = thema.body.split("\n");
    for (const l of lines) {
      const m = l.match(/^##\s+(.+)$/);
      if (m) {
        const title = m[1].trim();
        const id = title.toLowerCase()
          .replace(/[äöüß]/g, (c) => ({ "ä": "a", "ö": "o", "ü": "u", "ß": "ss" }[c] ?? c))
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        entries.push({ id, title });
      }
    }
    return entries;
  }, [thema.body]);

  return (
    <div className="min-h-screen pb-24 md:pb-10" ref={ref}>
      <NavBar />

      {/* Reading-Progress-Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent origin-left z-50"
        style={{ scaleX: smoothProgress }}
      />

      {/* XP-Burst */}
      {xpBurst && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4, y: 100 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.2, 1, 0.9], y: [100, 0, 0, -40] }}
          transition={{ duration: 2.5, times: [0, 0.15, 0.8, 1] }}
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="px-6 py-3 rounded-2xl bg-success/20 border border-success/50 backdrop-blur-md glow-success flex items-center gap-2">
            <Trophy className="h-5 w-5 text-success" />
            <span className="gravur text-2xl text-success font-semibold">+40 XP</span>
          </div>
        </motion.div>
      )}

      <article className="max-w-2xl mx-auto px-3 md:px-6 py-3 md:py-5 space-y-4">
        {/* Zurück */}
        <Link href="/lernen" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.25em]">
          <ArrowLeft className="h-3 w-3" /> Lernen
        </Link>

        {/* Hero · kompakt */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-[9px] uppercase tracking-widest h-5 px-2"
                   style={{ color: `oklch(0.78 0.14 ${cluster.hue})`, borderColor: `oklch(0.6 0.12 ${cluster.hue} / 0.4)` }}>
              {cluster.short}
            </Badge>
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {thema.frontmatter.dauer_min} min</span>
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Target className="h-2.5 w-2.5" /> {thema.frontmatter.schwierigkeit}/5</span>
            {marked && (
              <Badge className="text-[9px] bg-success/15 text-success border-success/30 h-5 px-2">
                <CheckCircle2 className="mr-1 h-2.5 w-2.5" /> Gelernt · +40
              </Badge>
            )}
          </div>
          <h1 className="gravur text-[26px] md:text-5xl font-medium leading-[1.05]">{thema.frontmatter.titel}</h1>
        </motion.div>

        {/* TOC · kompakt scrollbar */}
        {toc.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border/40 bg-card/30 overflow-hidden"
          >
            <button
              onClick={() => setTocOpen(!tocOpen)}
              className="w-full px-3 py-2 flex items-center justify-between text-xs"
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <List className="h-3 w-3" />
                <span className="uppercase tracking-widest text-[10px]">In diesem Lernzettel</span>
              </span>
              <motion.div animate={{ rotate: tocOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </motion.div>
            </button>
            {tocOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden border-t border-border/30"
              >
                <div className="p-2 flex flex-col gap-0.5">
                  {toc.map((t, i) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      onClick={() => setTocOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="gravur text-[10px] text-muted-foreground font-mono w-5">
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                      {t.title}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Body */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="thema-prose"
        >
          {segments.map((seg, i) => (
            <Fragment key={i}>
              {seg.kind === "markdown" ? (
                <MarkdownRenderer body={seg.text} />
              ) : (
                <ShortcodeRenderer segment={seg} />
              )}
            </Fragment>
          ))}
        </motion.div>

        {/* Praxis-Test-CTA */}
        {fragenCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-10 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent p-4 md:p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center animate-pulse-glow">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary">Praxis-Test</p>
                  <h3 className="gravur text-base md:text-lg font-medium">Sitzt das Thema?</h3>
                </div>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mb-3">
                {fragenCount} Fragen adaptiv · schwache zuerst.
              </p>
              <Link href={`/pruefung/session?mode=thema&slug=${thema.frontmatter.slug}&count=${Math.min(10, fragenCount)}`}>
                <Button size="lg" className="w-full rounded-xl shadow-lg shadow-primary/20">
                  Fragen starten <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        <ClawbuisPortal />
      </article>
    </div>
  );
}

function slugify(text: string) {
  return text.toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ "ä": "a", "ö": "o", "ü": "u", "ß": "ss" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (typeof children === "number") return String(children);
  return "";
}

// ─── Mobile-Optimized Markdown ──────────────────────────────────

function MarkdownRenderer({ body }: { body: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => {
          const id = slugify(extractText(children));
          return <h1 id={id} className="gravur text-xl md:text-2xl font-medium mt-6 mb-2 text-foreground scroll-mt-20">{children}</h1>;
        },
        h2: ({ children }) => {
          const id = slugify(extractText(children));
          return (
            <h2 id={id} className="gravur text-lg md:text-2xl font-medium mt-8 mb-2.5 pb-1.5 border-b border-border/40 text-foreground scroll-mt-20">
              {children}
            </h2>
          );
        },
        h3: ({ children }) => <h3 className="gravur text-base font-medium mt-4 mb-1.5 text-primary">{children}</h3>,
        h4: ({ children }) => <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-4 mb-1">{children}</h4>,
        p: ({ children }) => <p className="text-[13px] md:text-base leading-relaxed text-foreground/90 my-2.5">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic text-accent">{children}</em>,
        ul: ({ children }) => <ul className="my-3 space-y-1.5 pl-4 list-disc marker:text-primary">{children}</ul>,
        ol: ({ children }) => <ol className="my-3 space-y-1.5 pl-4 list-decimal marker:text-primary">{children}</ol>,
        li: ({ children }) => <li className="text-[13px] md:text-base leading-relaxed text-foreground/90 pl-1">{children}</li>,
        blockquote: ({ children }) => (
          <motion.blockquote
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="my-5 pl-3 border-l-4 border-accent bg-accent/8 py-3 pr-3 rounded-r-lg text-foreground/95 relative"
          >
            <Sparkles className="absolute top-2 right-2 h-3 w-3 text-accent/60" />
            <div className="pr-4 text-[13px] md:text-base leading-relaxed">{children}</div>
          </motion.blockquote>
        ),
        code: ({ children, className }) => {
          const inline = !className;
          return inline
            ? <code className="bg-muted/50 text-accent px-1.5 py-0.5 rounded text-[0.85em] font-mono break-words">{children}</code>
            : <pre className="my-3 rounded-lg bg-muted/40 border border-border/50 p-3 overflow-x-auto"><code className="text-xs md:text-sm font-mono text-foreground/90">{children}</code></pre>;
        },
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto rounded-lg border border-border/50 bg-card/30 -mx-3 md:mx-0">
            <table className="w-full text-xs md:text-sm min-w-[300px]">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-primary/10 text-primary">{children}</thead>,
        th: ({ children }) => <th className="px-2.5 py-1.5 text-left text-[9px] md:text-[10px] uppercase tracking-widest font-medium">{children}</th>,
        td: ({ children }) => <td className="px-2.5 py-1.5 border-t border-border/40 align-top">{children}</td>,
        hr: () => <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />,
        a: ({ href, children }) => (
          <a href={href} className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent break-words" target={href?.startsWith("http") ? "_blank" : undefined}>
            {children}
          </a>
        ),
      }}
    >
      {body}
    </ReactMarkdown>
  );
}

// ─── Shortcodes ───────────────────────────────────────────────

function ShortcodeRenderer({ segment }: { segment: Extract<Segment, { kind: "shortcode" }> }) {
  const { name, props, body } = segment;

  switch (name) {
    case "fakt":
      return <Fakt
        zahl={props.zahl ?? "?"}
        einheit={props.einheit}
        label={props.label ?? ""}
        color={(props.color as "primary" | "accent" | "destructive" | "success") ?? "accent"}
      />;
    case "formel":
      return <Formel
        label={props.label ?? "Formel"}
        formel={props.formel ?? ""}
        ergebnis={props.ergebnis}
        legende={props.legende}
      />;
    case "vergleich":
      return <Vergleich
        linksLabel={props.linksLabel ?? props.links ?? "A"}
        rechtsLabel={props.rechtsLabel ?? props.rechts ?? "B"}
        links={props.linksText ?? ""}
        rechts={props.rechtsText ?? ""}
      />;
    case "merkkarte":
      return <Merkkarte vorne={props.vorne ?? ""} hinten={props.hinten ?? body ?? ""} />;
    case "ablauf":
      return <Ablauf schritte={(props.schritte ?? "").split("|").map((s) => s.trim()).filter(Boolean)} />;
    case "statbar":
      return <StatBar
        label={props.label ?? ""}
        wert={Number(props.wert ?? 0)}
        max={Number(props.max ?? 100)}
        einheit={props.einheit}
        color={(props.color as "primary" | "accent" | "success" | "destructive") ?? "primary"}
      />;
    case "tipp":
      return <Tipp typ={(props.typ as "info" | "warn" | "success") ?? "info"}>
        <MarkdownRenderer body={body ?? ""} />
      </Tipp>;
    case "trend":
      return <Trend
        richtung={(props.richtung as "hoch" | "runter") ?? "hoch"}
        label={props.label ?? ""}
        bedeutung={props.bedeutung ?? ""}
      />;
    default:
      return null;
  }
}
