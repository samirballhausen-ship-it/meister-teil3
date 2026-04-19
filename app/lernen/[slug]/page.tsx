import { notFound } from "next/navigation";
import { loadThema, getFragenForThema, listThemenMetaByCluster } from "@/lib/content";
import { ThemaReader } from "@/components/thema-reader";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const all = await listThemenMetaByCluster();
  return Object.values(all).flat().map((t) => ({ slug: t.slug }));
}

export default async function ThemaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const thema = await loadThema(slug);
  if (!thema) notFound();
  const fragen = await getFragenForThema(slug);
  return <ThemaReader thema={thema} fragenCount={fragen.length} />;
}
