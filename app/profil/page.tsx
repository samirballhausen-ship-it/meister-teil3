import { loadMaster, listThemenMetaByCluster } from "@/lib/content";
import { ProfilSeite } from "@/components/profil-seite";

export default async function ProfilPage() {
  const master = await loadMaster();
  const themen = await listThemenMetaByCluster();
  const totalThemen = Object.values(themen).flat().length;
  return <ProfilSeite gesamtFragen={master.gesamt} gesamtThemen={totalThemen} />;
}
