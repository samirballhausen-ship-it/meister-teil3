import { loadMaster } from "@/lib/content";
import { PruefungHub } from "@/components/pruefung-hub";

export default async function PruefungPage() {
  const master = await loadMaster();
  return <PruefungHub gesamtFragen={master.gesamt} />;
}
