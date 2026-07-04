"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [role, setRole] = useState<"pemilik" | "anak_kos">("anak_kos");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "masuk") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Email atau kata sandi salah.");
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    router.refresh();
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-5">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-9">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-brass text-white font-display font-bold flex items-center justify-center">
            K
          </div>
          <h1 className="font-display text-xl font-semibold text-navy">Jersey Kos</h1>
        </div>
        <p className="text-ink-soft text-sm mb-7">
          {mode === "masuk" ? "Masuk ke akunmu." : "Buat akun baru untuk mulai."}
        </p>

        <div className="flex mb-6 rounded-lg bg-paper p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("masuk")}
            className={`flex-1 py-2 rounded-md transition ${
              mode === "masuk" ? "bg-white shadow text-navy" : "text-ink-soft"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setMode("daftar")}
            className={`flex-1 py-2 rounded-md transition ${
              mode === "daftar" ? "bg-white shadow text-navy" : "text-ink-soft"
            }`}
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "daftar" && (
            <>
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-brass"
                  placeholder="Nama kamu"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">
                  Daftar sebagai
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("anak_kos")}
                    className={`py-2.5 rounded-lg border text-sm font-medium ${
                      role === "anak_kos"
                        ? "border-brass bg-brass/10 text-brass"
                        : "border-line text-ink-soft"
                    }`}
                  >
                    Anak Kos
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("pemilik")}
                    className={`py-2.5 rounded-lg border text-sm font-medium ${
                      role === "pemilik"
                        ? "border-brass bg-brass/10 text-brass"
                        : "border-line text-ink-soft"
                    }`}
                  >
                    Pemilik Kos
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-brass"
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Kata Sandi</label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:border-brass"
              placeholder="Minimal 6 karakter"
            />
          </div>

          {error && <p className="text-terracotta text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brass text-white font-semibold text-sm disabled:opacity-60"
          >
            {loading ? "Memproses…" : mode === "masuk" ? "Masuk" : "Buat Akun"}
          </button>
        </form>
      </div>
    </div>
  );
}
