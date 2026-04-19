import { loadMaster, getFragenForThema } from "@/lib/content";
import { SessionRunner } from "@/components/session-runner";

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; slug?: string; count?: string; timer?: string }>;
}) {
  const p = await searchParams;
  const mode = p.mode ?? "mix";
  const slug = p.slug;
  const count = Number(p.count ?? 10);
  const timer = p.timer ? Number(p.timer) : undefined;

  const master = await loadMaster();
  const pool = slug ? await getFragenForThema(slug) : master.fragen;

  return <SessionRunner pool={pool} mode={mode} count={count} timerSec={timer} />;
}
