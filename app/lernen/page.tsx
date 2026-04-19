import { Suspense } from "react";
import { listThemenMetaByCluster } from "@/lib/content";
import { LernenHub } from "@/components/lernen-hub";

export default async function LernenPage() {
  const themenByCluster = await listThemenMetaByCluster();
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-muted-foreground">…</div>}>
      <LernenHub themenByCluster={themenByCluster} />
    </Suspense>
  );
}
