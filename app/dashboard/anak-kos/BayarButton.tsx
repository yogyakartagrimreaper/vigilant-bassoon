"use client";

import { useState } from "react";
import { catatPembayaranSendiri } from "./actions";

export default function BayarButton({
  tenantId,
  bulan,
  jumlah,
}: {
  tenantId: string;
  bulan: string;
  jumlah: number;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await catatPembayaranSendiri(tenantId, bulan, jumlah);
    setLoading(false);
    alert("Tercatat! Pemilik kos akan mengonfirmasi pembayaranmu.");
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-brass text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-brass/90 disabled:opacity-60"
    >
      {loading ? "Menyimpan…" : `Catat Pembayaran ${bulan}`}
    </button>
  );
}
