"use client";

import { useState } from "react";
import { savePembayaran, deletePembayaran } from "../actions";

type Payment = {
  id: string;
  penyewa_id: string;
  bulan: string;
  jumlah: number;
  status: string;
  tanggal_bayar: string | null;
};
type Tenant = { id: string; nama: string };

const rupiah = (n: number) => {
  const bulat = Math.round(Number(n) || 0);
  return "Rp" + bulat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const bulanIni = () => {
  const bulan = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const d = new Date();
  return `${bulan[d.getMonth()]} ${d.getFullYear()}`;
};

export default function PembayaranManager({
  payments,
  tenants,
}: {
  payments: Payment[];
  tenants: Tenant[];
}) {
  const [editing, setEditing] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);

  function tenantName(id: string) {
    return tenants.find((t) => t.id === id)?.nama ?? "Penyewa dihapus";
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy mb-1">Pembayaran</h2>
          <p className="text-ink-soft text-sm">Riwayat tagihan dan pelunasan tiap penyewa</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="bg-brass text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-brass/90"
        >
          + Catat Pembayaran
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-14 border-2 border-dashed border-line rounded-xl text-ink-soft text-sm">
          Belum ada catatan pembayaran.
        </div>
      ) : (
        <table className="w-full bg-white rounded-xl border border-line overflow-hidden text-sm">
          <thead>
            <tr className="bg-[#EFE7D3] text-left text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-3.5 py-3">Penyewa</th>
              <th className="px-3.5 py-3">Bulan</th>
              <th className="px-3.5 py-3">Jumlah</th>
              <th className="px-3.5 py-3">Status</th>
              <th className="px-3.5 py-3">Tanggal Bayar</th>
              <th className="px-3.5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-3.5 py-3 font-medium">{tenantName(p.penyewa_id)}</td>
                <td className="px-3.5 py-3">{p.bulan}</td>
                <td className="px-3.5 py-3">{rupiah(p.jumlah)}</td>
                <td className="px-3.5 py-3">
                  <span className={`badge ${p.status === "lunas" ? "lunas" : "belum"}`}>
                    {p.status === "lunas" ? "Lunas" : "Belum Bayar"}
                  </span>
                </td>
                <td className="px-3.5 py-3">{p.tanggal_bayar || "-"}</td>
                <td className="px-3.5 py-3">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setShowModal(true);
                      }}
                      className="text-[11.5px] px-2.5 py-1.5 rounded-md border border-line text-ink-soft hover:border-brass hover:text-brass"
                    >
                      Ubah
                    </button>
                    <form
                      action={async () => {
                        if (confirm("Hapus catatan ini?")) await deletePembayaran(p.id);
                      }}
                    >
                      <button className="text-[11.5px] px-2.5 py-1.5 rounded-md border border-line text-ink-soft hover:border-terracotta hover:text-terracotta">
                        Hapus
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-navy/45 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-display text-lg text-navy mb-4">
              {editing ? "Ubah Pembayaran" : "Catat Pembayaran"}
            </h3>
            <form
              action={async (fd) => {
                await savePembayaran(fd);
                setShowModal(false);
              }}
              className="space-y-3.5"
            >
              {editing && <input type="hidden" name="id" value={editing.id} />}
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">Penyewa</label>
                <select name="penyewa_id" required defaultValue={editing?.penyewa_id ?? ""} className="k-input">
                  <option value="" disabled>
                    — Pilih penyewa —
                  </option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">Bulan</label>
                <input name="bulan" required defaultValue={editing?.bulan ?? bulanIni()} className="k-input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">Jumlah (Rp)</label>
                <input name="jumlah" type="number" required defaultValue={editing?.jumlah} className="k-input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">Status</label>
                <select name="status" defaultValue={editing?.status ?? "belum"} className="k-input">
                  <option value="belum">Belum Bayar</option>
                  <option value="lunas">Lunas</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">Tanggal Bayar</label>
                <input
                  name="tanggal_bayar"
                  type="date"
                  defaultValue={editing?.tanggal_bayar ?? ""}
                  className="k-input"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-line text-sm font-medium"
                >
                  Batal
                </button>
                <button className="flex-1 py-2.5 rounded-lg bg-brass text-white text-sm font-semibold">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
