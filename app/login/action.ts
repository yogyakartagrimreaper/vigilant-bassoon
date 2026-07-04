"use server";

import { createClient } from "@/lib/supabase/server";

export async function daftarAkun(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const kodePemilik = (formData.get("kodePemilik") as string) || "";

  // Validasi kode rahasia HANYA terjadi di server — tidak pernah dikirim
  // ke browser, jadi tidak bisa diakalin lewat DevTools atau request manual.
  if (role === "pemilik") {
    const kodeAsli = process.env.OWNER_SIGNUP_CODE;
    if (!kodeAsli || kodePemilik !== kodeAsli) {
      return { success: false, message: "Kode pendaftaran Pemilik salah." };
    }
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        // role akhirnya ditentukan di sini (server), bukan dari input mentah,
        // supaya walaupun seseorang mengubah value di browser, mereka tetap
        // tidak bisa jadi pemilik tanpa kode yang benar.
        role: role === "pemilik" ? "pemilik" : "anak_kos",
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Akun berhasil dibuat." };
}
