/**
 * Content-Loader · Server-side read von content/
 */

import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { Cluster, Frage, Thema, ThemaFrontmatter, StundenplanTag } from "./types";

const CONTENT_DIR    = path.join(process.cwd(), "content");
const THEMEN_DIR     = path.join(CONTENT_DIR, "themen");
const FRAGEN_FILE    = path.join(CONTENT_DIR, "fragen", "master.json");
const STUNDENPLAN_F  = path.join(CONTENT_DIR, "lehrplan", "stundenplan.json");

// ─── Cache ─────────────────────────────────────────────────────────

let cacheMaster: { version: number; fragen: Frage[]; gesamt: number; cluster_count: Record<string, number> } | null = null;
let cacheThemen: Map<string, Thema> | null = null;
let cacheSplan:  { tage: StundenplanTag[]; lehrgang: Record<string, unknown> } | null = null;

export async function loadMaster() {
  if (cacheMaster) return cacheMaster;
  const raw = await fs.readFile(FRAGEN_FILE, "utf-8");
  cacheMaster = JSON.parse(raw);
  return cacheMaster!;
}

export async function loadThemen(): Promise<Map<string, Thema>> {
  if (cacheThemen) return cacheThemen;
  const files = await fs.readdir(THEMEN_DIR);
  const map = new Map<string, Thema>();
  for (const f of files.filter((x) => x.endsWith(".mdx"))) {
    const raw = await fs.readFile(path.join(THEMEN_DIR, f), "utf-8");
    const parsed = matter(raw);
    const fm = parsed.data as ThemaFrontmatter;
    map.set(fm.slug, { frontmatter: fm, body: parsed.content });
  }
  cacheThemen = map;
  return map;
}

export async function loadThema(slug: string): Promise<Thema | null> {
  const all = await loadThemen();
  return all.get(slug) ?? null;
}

export async function loadStundenplan() {
  if (cacheSplan) return cacheSplan;
  const raw = await fs.readFile(STUNDENPLAN_F, "utf-8");
  cacheSplan = JSON.parse(raw);
  return cacheSplan!;
}

export async function getThemenByCluster(cluster: Cluster): Promise<ThemaFrontmatter[]> {
  const all = await loadThemen();
  return Array.from(all.values())
    .filter((t) => t.frontmatter.cluster === cluster)
    .map((t) => t.frontmatter)
    .sort((a, b) => a.reihenfolge - b.reihenfolge);
}

export async function getFragenByCluster(cluster: Cluster): Promise<Frage[]> {
  const m = await loadMaster();
  return m.fragen.filter((q) => q.cluster === cluster);
}

export async function getFragenForThema(slug: string): Promise<Frage[]> {
  const m = await loadMaster();
  const t = await loadThema(slug);
  const ids = new Set(t?.frontmatter.fragen ?? []);
  return m.fragen.filter((q) => ids.has(q.id) || q.thema === slug);
}

export async function listThemenMetaByCluster(): Promise<Record<Cluster, ThemaFrontmatter[]>> {
  const all = await loadThemen();
  const clusters: Record<string, ThemaFrontmatter[]> = {};
  for (const t of all.values()) {
    const c = t.frontmatter.cluster;
    if (!clusters[c]) clusters[c] = [];
    clusters[c].push(t.frontmatter);
  }
  for (const k of Object.keys(clusters)) clusters[k].sort((a, b) => a.reihenfolge - b.reihenfolge);
  return clusters as Record<Cluster, ThemaFrontmatter[]>;
}

export async function getContentStats() {
  const m = await loadMaster();
  const t = await loadThemen();
  const s = await loadStundenplan();
  return {
    fragen_gesamt: m.gesamt,
    themen_gesamt: t.size,
    cluster_count: m.cluster_count,
    tage_erfasst: s.tage?.length ?? 0,
    pruefung_datum: (s.lehrgang as { pruefung_datum?: string })?.pruefung_datum,
  };
}
