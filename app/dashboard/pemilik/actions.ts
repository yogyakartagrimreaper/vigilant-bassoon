"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ---------- KAMAR ----------
export async function saveKamar(formData: FormData) {
  const supabase = createClient();
  const id = formData.get("id") as string;
  const payload = {
    nomor: formData.get("nomor") as string,
    tipe: (formData.get("tipe") as string) || "Standar",
    harga: Number(formData.get("harga")) || 0,
    status: formData.get("status") as string,
  };
  if (id) {
    await supabase.from("kamar").update(payload).eq("id", id);
  } else {
    await supabase.from("kamar").insert(payload);
  }
  revalidatePath("/dashboard/pemilik/kamar");
}

export async function deleteKamar(id: string) {
  const supabase = createClient();
  await supabase.from("kamar").delete().eq("id", id);
  revalidatePath("/dashboard/pemilik/kamar");
}

// ---------- PENYEWA ----------
export async function savePenyewa(formData: FormData) {
  const supabase = createClient();
  const id = formData.get("id") as string;
  const kamarId = (formData.get("kamar_id") as string) || null;
  const payload = {
    nama: formData.get("nama") as string,
    kontak: formData.get("kontak") as string,
    kamar_id: kamarId,
    mulai_sewa: (formData.get("mulai_sewa") as string) || null,
  };
  if (id) {
    const { data: prev } = await supabase.from("penyewa").select("kamar_id").eq("id", id).single();
    if (prev?.kamar_id && prev.kamar_id !== kamarId) {
      await supabase.from("kamar").update({ status: "kosong" }).eq("id", prev.kamar_id);
    }
    await supabase.from("penyewa").update(payload).eq("id", id);
  } else {
    await supabase.from("penyewa").insert(payload);
  }
  if (kamarId) {
    await supabase.from("kamar").update({ status: "terisi" }).eq("id", kamarId);
  }
  revalidatePath("/dashboard/pemilik/penyewa");
  revalidatePath("/dashboard/pemilik/kamar");
}

export async function deletePenyewa(id: string) {
  const supabase = createClient();
  const { data: prev } = await supabase.from("penyewa").select("kamar_id").eq("id", id).single();
  if (prev?.kamar_id) {
    await supabase.from("kamar").update({ status: "kosong" }).eq("id", prev.kamar_id);
  }
  await supabase.from("penyewa").delete().eq("id", id);
  revalidatePath("/dashboard/pemilik/penyewa");
  revalidatePath("/dashboard/pemilik/kamar");
}

// ---------- TAUTKAN AKUN ANAK KOS ----------
export async function tautkanAkun(penyewaId: string, email: string) {
  const supabase = createClient();
  const cleanEmail = email.trim().toLowerCase();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (error || !profile) {
    return { success: false, message: "Tidak ditemukan akun dengan email itu. Pastikan anak kos sudah mendaftar terlebih dahulu." };
  }
  if (profile.role !== "anak_kos") {
    return { success: false, message: "Email itu terdaftar sebagai akun Pemilik, bukan Anak Kos." };
  }

  const { data: existing } = await supabase
    .from("penyewa")
    .select("id, nama")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (existing && existing.id !== penyewaId) {
    return { success: false, message: `Akun ini sudah tertaut ke penyewa lain (${existing.nama}).` };
  }

  await supabase.from("penyewa").update({ user_id: profile.id }).eq("id", penyewaId);
  revalidatePath("/dashboard/pemilik/penyewa");
  return { success: true, message: `Berhasil ditautkan ke akun ${profile.full_name}.` };
}

export async function putuskanAkun(penyewaId: string) {
  const supabase = createClient();
  await supabase.from("penyewa").update({ user_id: null }).eq("id", penyewaId);
  revalidatePath("/dashboard/pemilik/penyewa");
}

// ---------- PEMBAYARAN ----------
export async function savePembayaran(formData: FormData) {
  const supabase = createClient();
  const id = formData.get("id") as string;
  const payload = {
    penyewa_id: formData.get("penyewa_id") as string,
    bulan: formData.get("bulan") as string,
    jumlah: Number(formData.get("jumlah")) || 0,
    status: formData.get("status") as string,
    tanggal_bayar: (formData.get("tanggal_bayar") as string) || null,
  };
  if (id) {
    await supabase.from("pembayaran").update(payload).eq("id", id);
  } else {
    await supabase.from("pembayaran").insert(payload);
  }
  revalidatePath("/dashboard/pemilik/pembayaran");
}

export async function deletePembayaran(id: string) {
  const supabase = createClient();
  await supabase.from("pembayaran").delete().eq("id", id);
  revalidatePath("/dashboard/pemilik/pembayaran");
}