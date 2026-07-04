"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function catatPembayaranSendiri(
  penyewaId: string,
  bulan: string,
  jumlah: number
) {
  const supabase = createClient();

  await supabase.from("pembayaran").insert({
    penyewa_id: penyewaId,
    bulan,
    jumlah,
    status: "belum",
  });

  revalidatePath("/dashboard/anak-kos");
}
