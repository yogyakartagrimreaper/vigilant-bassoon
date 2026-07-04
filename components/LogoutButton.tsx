"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-xs font-medium text-white/85 bg-white/10 hover:bg-white/20 py-2 rounded-lg transition"
    >
      Keluar
    </button>
  );
}
