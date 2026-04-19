import { loadMaster, getContentStats, listThemenMetaByCluster } from "@/lib/content";
import { Dashboard } from "@/components/dashboard";

export default async function HomePage() {
  const master = await loadMaster();
  const stats = await getContentStats();
  const themenByCluster = await listThemenMetaByCluster();
  return <Dashboard master={master} contentStats={stats} themenByCluster={themenByCluster} />;
}
