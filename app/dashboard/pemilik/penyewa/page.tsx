import { createClient } from "@/lib/supabase/server";
import PenyewaManager from "./PenyewaManager";

export default async function PenyewaPage() {
  const supabase = createClient();

  const { data: tenants } = await supabase
    .from("penyewa")
    .select("*")
    .order("nama");
  const { data: rooms } = await supabase.from("kamar").select("id, nomor").order("nomor");

  return <PenyewaManager tenants={tenants ?? []} rooms={rooms ?? []} />;
}
