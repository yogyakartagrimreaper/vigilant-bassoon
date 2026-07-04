import { createClient } from "@/lib/supabase/server";
import KamarManager from "./KamarManager";

export default async function KamarPage() {
  const supabase = createClient();

  const { data: rooms } = await supabase.from("kamar").select("*").order("nomor");
  const { data: tenants } = await supabase.from("penyewa").select("id, nama, kamar_id");

  return <KamarManager rooms={rooms ?? []} tenants={tenants ?? []} />;
}
