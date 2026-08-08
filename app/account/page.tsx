import type { Metadata } from "next";
import { AdvertiserPortal } from "@/components/advertiser-portal";
import { AgeGate } from "@/components/age-gate";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = { title: "Advertiser Dashboard", robots: { index: false, follow: false } };

export default function AccountPage() {
  return <><AgeGate /><div className="section-space"><div className="site-container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Advertiser Dashboard" }]} /><h1 className="mb-8 text-4xl font-bold tracking-[-0.05em]">Advertiser dashboard</h1><AdvertiserPortal dashboard /></div></div></>;
}
