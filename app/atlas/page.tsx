import { loadMaster, listThemenMetaByCluster, getContentStats } from "@/lib/content";
import { MeisterAtlas } from "@/components/meister-atlas";

export default async function AtlasPage() {
  const master = await loadMaster();
  const themenByCluster = await listThemenMetaByCluster();
  const stats = await getContentStats();
  return (
    <MeisterAtlas
      master={master}
      themenByCluster={themenByCluster}
      pruefungsDatum={stats.pruefung_datum}
    />
  );
}
