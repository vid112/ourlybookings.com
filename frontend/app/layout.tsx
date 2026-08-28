import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Ourly Bookings | Independent Profiles Worldwide",
    template: "%s | Ourly Bookings",
    verification: {
  google: "0AJ6XMPHikSfGKHp01VGEOmnUlXznbUmtdXwKAFiXqE",
},
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    title: "Ourly Bookings | Independent Profiles Worldwide",
    description: siteConfig.description,
    images: [{ url: "/images/hero-lounge.png", width: 1792, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ourly Bookings",
    description: siteConfig.description,
    images: ["/images/hero-lounge.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <a
          href="#main-content"
          className="fixed left-3 top-3 z-[120] -translate-y-24 rounded-lg bg-paper px-4 py-2 font-bold text-ink focus:translate-y-0"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
