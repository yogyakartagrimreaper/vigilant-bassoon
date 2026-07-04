import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jersey Kos — Manajemen Kos",
  description: "240-232 Main St, West Orange, NJ 07052",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans">{children}</body>
    </html>
  );
}