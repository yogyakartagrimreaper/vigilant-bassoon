import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function PemilikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "pemilik") redirect("/dashboard/anak-kos");

  const navItems = [
    { href: "/dashboard/pemilik/kamar", label: "Kamar", icon: "🛏️" },
    { href: "/dashboard/pemilik/penyewa", label: "Penyewa", icon: "👤" },
    { href: "/dashboard/pemilik/pembayaran", label: "Pembayaran", icon: "💵" },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-navy text-white p-5 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-8 px-1.5">
          <div className="w-7 h-7 rounded-md bg-brass-light text-navy font-display font-bold text-sm flex items-center justify-center">
            K
          </div>
          <span className="font-display font-semibold text-[15px]">Jersey Kos</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="text-xs text-white/50 mb-2">
            Masuk sebagai
            <br />
            <strong className="text-white">{profile?.full_name}</strong>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
