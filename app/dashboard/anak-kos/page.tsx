import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import BayarButton from "./BayarButton";

const rupiah = (n: number) => {
  const bulat = Math.round(Number(n) || 0);
  return "Rp" + bulat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const bulanIni = () => {
  const bulan = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const d = new Date();
  return `${bulan[d.getMonth()]} ${d.getFullYear()}`;
};

export default async function AnakKosPage() {
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
  if (profile?.role === "pemilik") redirect("/dashboard/pemilik/kamar");

  const { data: tenant } = await supabase
    .from("penyewa")
    .select("*, kamar:kamar_id ( nomor, tipe, harga )")
    .eq("user_id", user.id)
    .single();

  const { data: payments } = tenant
    ? await supabase
        .from("pembayaran")
        .select("*")
        .eq("penyewa_id", tenant.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const thisMonth = bulanIni();
  const paidThisMonth = payments?.find((p) => p.bulan === thisMonth && p.status === "lunas");
  const room = (tenant as any)?.kamar;

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-6">
        <div className="text-center max-w-sm">
          <p className="text-ink-soft text-sm mb-4">
            Akunmu belum dipasangkan ke data penyewa. Hubungi pemilik kos untuk menautkan akunmu.
          </p>
          <LogoutButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-navy text-white p-5 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-8 px-1.5">
          <div className="w-7 h-7 rounded-md bg-brass-light text-navy font-display font-bold text-sm flex items-center justify-center">
            K
          </div>
          <span className="font-display font-semibold text-[15px]">Jersey Kos</span>
        </div>
        <div className="px-3 py-2.5 rounded-lg bg-brass text-sm font-medium">👤 Kamar Saya</div>
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="text-xs text-white/50 mb-2">
            Masuk sebagai
            <br />
            <strong className="text-white">{tenant.nama}</strong>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-8">
        <h2 className="font-display text-2xl font-semibold text-navy mb-1">
          Halo, {tenant.nama.split(" ")[0]}
        </h2>
        <p className="text-ink-soft text-sm mb-6">Ringkasan kamar dan pembayaran kamu</p>

        <div className="bg-navy rounded-2xl p-6 text-white mb-5 flex justify-between items-center gap-5 flex-wrap">
          <div>
            <div className="text-xs text-white/60 mb-1">Nomor Kamar</div>
            <div className="font-mono text-4xl text-brass-light">{room?.nomor ?? "-"}</div>
          </div>
          <div className="bg-white/10 px-3.5 py-2 rounded-full text-[12.5px]">
            {paidThisMonth ? "✅ Lunas bulan ini" : "⏳ Belum bayar bulan ini"}
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mb-6">
          <InfoCard label="Tipe Kamar" value={room?.tipe ?? "-"} />
          <InfoCard label="Harga / Bulan" value={room ? rupiah(room.harga) : "-"} />
          <InfoCard label="Mulai Sewa" value={tenant.mulai_sewa ?? "-"} small />
        </div>

        <div className="flex justify-between items-center mb-3">
          <h3 className="font-display text-[17px] text-navy">Riwayat Pembayaran</h3>
          {!paidThisMonth && (
            <BayarButton tenantId={tenant.id} bulan={thisMonth} jumlah={room?.harga ?? 0} />
          )}
        </div>

        {payments && payments.length > 0 ? (
          <table className="w-full bg-white rounded-xl border border-line overflow-hidden text-sm">
            <thead>
              <tr className="bg-[#EFE7D3] text-left text-[11px] uppercase tracking-wide text-ink-soft">
                <th className="px-3.5 py-3">Bulan</th>
                <th className="px-3.5 py-3">Jumlah</th>
                <th className="px-3.5 py-3">Status</th>
                <th className="px-3.5 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-3.5 py-3">{p.bulan}</td>
                  <td className="px-3.5 py-3">{rupiah(p.jumlah)}</td>
                  <td className="px-3.5 py-3">
                    <span className={`badge ${p.status === "lunas" ? "lunas" : "belum"}`}>
                      {p.status === "lunas" ? "Lunas" : "Belum Bayar"}
                    </span>
                  </td>
                  <td className="px-3.5 py-3">{p.tanggal_bayar || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-14 border-2 border-dashed border-line rounded-xl text-ink-soft text-sm">
            Belum ada riwayat pembayaran.
          </div>
        )}
      </main>
    </div>
  );
}

function InfoCard({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="bg-white border border-line rounded-lg px-4 py-3.5">
      <div className="text-[11.5px] uppercase tracking-wide text-ink-soft mb-1">{label}</div>
      <div className={`font-display font-semibold text-navy ${small ? "text-sm" : "text-[17px]"}`}>{value}</div>
    </div>
  );
}
