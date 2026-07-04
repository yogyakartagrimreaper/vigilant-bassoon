"use client";

import { useState } from "react";
import { saveKamar, deleteKamar } from "../actions";

type Room = {
  id: string;
  nomor: string;
  tipe: string;
  harga: number;
  status: string;
};
type Tenant = { id: string; nama: string; kamar_id: string | null };

const rupiah = (n: number) => {
  const bulat = Math.round(Number(n) || 0);
  return "Rp" + bulat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function KamarManager({
  rooms,
  tenants,
}: {
  rooms: Room[];
  tenants: Tenant[];
}) {
  const [editing, setEditing] = useState<Room | null>(null);
  const [showModal, setShowModal] = useState(false);

  function openNew() {
    setEditing(null);
    setShowModal(true);
  }
  function openEdit(r: Room) {
    setEditing(r);
    setShowModal(true);
  }

  function occupantOf(roomId: string) {
    return tenants.find((t) => t.kamar_id === roomId);
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy mb-1">Kamar</h2>
          <p className="text-ink-soft text-sm">
            {rooms.length} kamar terdaftar · {rooms.filter((r) => r.status === "terisi").length} terisi
          </p>
        </div>
        <button
          onClick={openNew}
          className="bg-brass text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-brass/90"
        >
          + Tambah Kamar
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-14 border-2 border-dashed border-line rounded-xl text-ink-soft text-sm">
          Belum ada kamar. Tambahkan kamar pertama untuk mulai mengelola kos.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3.5">
          {rooms.map((r) => {
            const occ = occupantOf(r.id);
            return (
              <div key={r.id} className="bg-white rounded-xl border border-line p-4 relative">
                <span
                  className={`absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full ${
                    r.status === "terisi" ? "bg-sage" : "bg-ink-soft"
                  }`}
                />
                <div className="font-mono text-2xl text-navy">{r.nomor}</div>
                <div className="text-xs text-ink-soft mb-3">
                  {r.tipe} · {r.status === "terisi" ? "Terisi" : "Kosong"}
                </div>
                <div className="font-display text-brass font-semibold text-base">
                  {rupiah(r.harga)} <span className="font-sans font-normal text-ink-soft text-[11px]">/bln</span>
                </div>
                <div className="text-xs text-ink-soft mt-2 pt-2 border-t border-dashed border-line">
                  {occ ? `👤 ${occ.nama}` : "Belum ada penyewa"}
                </div>
                <div className="flex gap-1.5 mt-3">
                  <button
                    onClick={() => openEdit(r)}
                    className="flex-1 text-[11px] py-1.5 rounded-md border border-line text-ink-soft hover:border-brass hover:text-brass"
                  >
                    Ubah
                  </button>
                  <form
                    action={async () => {
                      if (confirm("Hapus kamar ini?")) await deleteKamar(r.id);
                    }}
                    className="flex-1"
                  >
                    <button className="w-full text-[11px] py-1.5 rounded-md border border-line text-ink-soft hover:border-terracotta hover:text-terracotta">
                      Hapus
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-navy/45 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-display text-lg text-navy mb-4">
              {editing ? "Ubah Kamar" : "Tambah Kamar"}
            </h3>
            <form
              action={async (fd) => {
                await saveKamar(fd);
                setShowModal(false);
              }}
              className="space-y-3.5"
            >
              {editing && <input type="hidden" name="id" value={editing.id} />}
              <Field label="Nomor Kamar">
                <input
                  name="nomor"
                  required
                  defaultValue={editing?.nomor}
                  placeholder="mis. 04"
                  className="k-input"
                />
              </Field>
              <Field label="Tipe">
                <input
                  name="tipe"
                  defaultValue={editing?.tipe ?? "Standar"}
                  placeholder="Standar / AC"
                  className="k-input"
                />
              </Field>
              <Field label="Harga per Bulan (Rp)">
                <input
                  name="harga"
                  type="number"
                  required
                  defaultValue={editing?.harga}
                  className="k-input"
                />
              </Field>
              <Field label="Status">
                <select name="status" defaultValue={editing?.status ?? "kosong"} className="k-input">
                  <option value="kosong">Kosong</option>
                  <option value="terisi">Terisi</option>
                </select>
              </Field>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-soft mb-1.5">{label}</label>
      {children}
    </div>
  );
}
