"use client";

import { useState } from "react";
import { savePenyewa, deletePenyewa, tautkanAkun, putuskanAkun } from "../actions";

type Tenant = {
  id: string;
  nama: string;
  kontak: string | null;
  kamar_id: string | null;
  mulai_sewa: string | null;
  user_id: string | null;
};
type Room = { id: string; nomor: string };

export default function PenyewaManager({
  tenants,
  rooms,
}: {
  tenants: Tenant[];
  rooms: Room[];
}) {
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [linkTarget, setLinkTarget] = useState<Tenant | null>(null);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkMsg, setLinkMsg] = useState<{ success: boolean; message: string } | null>(null);

  async function handleLink() {
    if (!linkTarget) return;
    setLinkLoading(true);
    setLinkMsg(null);
    const res = await tautkanAkun(linkTarget.id, linkEmail);
    setLinkLoading(false);
    setLinkMsg(res);
    if (res.success) {
      setTimeout(() => {
        setLinkTarget(null);
        setLinkEmail("");
        setLinkMsg(null);
      }, 1200);
    }
  }

  function roomLabel(id: string | null) {
    const r = rooms.find((r) => r.id === id);
    return r ? `Kamar ${r.nomor}` : null;
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy mb-1">Penyewa</h2>
          <p className="text-ink-soft text-sm">{tenants.length} anak kos terdaftar</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="bg-brass text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-brass/90"
        >
          + Tambah Penyewa
        </button>
      </div>

      {tenants.length === 0 ? (
        <div className="text-center py-14 border-2 border-dashed border-line rounded-xl text-ink-soft text-sm">
          Belum ada penyewa. Tambahkan penyewa dan pasangkan dengan kamar.
        </div>
      ) : (
        <table className="w-full bg-white rounded-xl border border-line overflow-hidden text-sm">
          <thead>
            <tr className="bg-[#F4F5F0] text-left text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-3.5 py-3">Nama</th>
              <th className="px-3.5 py-3">Kamar</th>
              <th className="px-3.5 py-3">Kontak</th>
              <th className="px-3.5 py-3">Mulai Sewa</th>
              <th className="px-3.5 py-3">Akun</th>
              <th className="px-3.5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-t border-line">
                <td className="px-3.5 py-3 font-medium">{t.nama}</td>
                <td className="px-3.5 py-3 text-ink-soft">{roomLabel(t.kamar_id) ?? "Belum ada kamar"}</td>
                <td className="px-3.5 py-3">{t.kontak || "-"}</td>
                <td className="px-3.5 py-3">{t.mulai_sewa || "-"}</td>
                <td className="px-3.5 py-3">
                  {t.user_id ? (
                    <div className="flex items-center gap-2">
                      <span className="badge lunas">Tertaut</span>
                      <button
                        onClick={async () => {
                          if (confirm("Putuskan tautan akun ini?")) await putuskanAkun(t.id);
                        }}
                        className="text-[11px] text-ink-soft underline hover:text-terracotta"
                      >
                        Putuskan
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setLinkTarget(t);
                        setLinkEmail("");
                        setLinkMsg(null);
                      }}
                      className="text-[11.5px] px-2.5 py-1.5 rounded-md border border-brass/40 text-brass hover:bg-brass/10"
                    >
                      🔗 Tautkan Akun
                    </button>
                  )}
                </td>
                <td className="px-3.5 py-3">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setEditing(t);
                        setShowModal(true);
                      }}
                      className="text-[11.5px] px-2.5 py-1.5 rounded-md border border-line text-ink-soft hover:border-brass hover:text-brass"
                    >
                      Ubah
                    </button>
                    <form
                      action={async () => {
                        if (confirm("Hapus penyewa ini?")) await deletePenyewa(t.id);
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
              {editing ? "Ubah Penyewa" : "Tambah Penyewa"}
            </h3>
            <form
              action={async (fd) => {
                await savePenyewa(fd);
                setShowModal(false);
              }}
              className="space-y-3.5"
            >
              {editing && <input type="hidden" name="id" value={editing.id} />}
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">Nama</label>
                <input name="nama" required defaultValue={editing?.nama} className="k-input" placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">Kontak</label>
                <input name="kontak" defaultValue={editing?.kontak ?? ""} className="k-input" placeholder="08xx-xxxx-xxxx" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">Kamar</label>
                <select name="kamar_id" defaultValue={editing?.kamar_id ?? ""} className="k-input">
                  <option value="">— Pilih kamar —</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Kamar {r.nomor}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">Mulai Sewa</label>
                <input
                  name="mulai_sewa"
                  type="date"
                  defaultValue={editing?.mulai_sewa ?? ""}
                  className="k-input"
                />
              </div>
              {!editing && (
                <label className="flex items-center gap-2.5 text-sm text-ink-soft bg-paper px-3 py-2.5 rounded-lg">
                  <input type="checkbox" name="buat_tagihan" defaultChecked className="w-4 h-4" />
                  Langsung buat tagihan bulan ini (sesuai harga kamar)
                </label>
              )}
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

      {linkTarget && (
        <div className="fixed inset-0 bg-navy/45 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-display text-lg text-navy mb-1.5">Tautkan Akun</h3>
            <p className="text-ink-soft text-sm mb-4">
              Masukkan email akun Anak Kos milik <strong>{linkTarget.nama}</strong>. Pastikan mereka
              sudah mendaftar terlebih dahulu di halaman login.
            </p>
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1.5">Email Anak Kos</label>
              <input
                type="email"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                className="k-input"
                placeholder="nama@email.com"
              />
            </div>

            {linkMsg && (
              <p className={`text-xs mt-3 ${linkMsg.success ? "text-sage" : "text-terracotta"}`}>
                {linkMsg.success ? "✅ " : "⚠️ "}
                {linkMsg.message}
              </p>
            )}

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setLinkTarget(null);
                  setLinkMsg(null);
                }}
                className="flex-1 py-2.5 rounded-lg border border-line text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleLink}
                disabled={linkLoading || !linkEmail}
                className="flex-1 py-2.5 rounded-lg bg-brass text-white text-sm font-semibold disabled:opacity-60"
              >
                {linkLoading ? "Memeriksa…" : "Tautkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
