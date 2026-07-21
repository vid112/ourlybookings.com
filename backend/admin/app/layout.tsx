import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Ourly Admin", robots: { index: false, follow: false } };
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
