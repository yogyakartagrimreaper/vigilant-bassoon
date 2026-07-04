import { createClient } from "@/lib/supabase/server";
import PembayaranManager from "./PembayaranManager";

export default async function PembayaranPage() {
  const supabase = createClient();

  const { data: payments } = await supabase
    .from("pembayaran")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: tenants } = await supabase.from("penyewa").select("id, nama").order("nama");

  return <PembayaranManager payments={payments ?? []} tenants={tenants ?? []} />;
}
