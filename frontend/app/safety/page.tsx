import type { Metadata } from "next";
import { EyeOff, Flag, ShieldCheck, UserRoundCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
export const metadata: Metadata = {
  title: "Safety and Privacy",
  description: "Consent, verification, privacy and content-reporting guidance for Ourly Bookings.",
  alternates: { canonical: "/safety" },
};
const principles = [
  [
    UserRoundCheck,
    "Adults and consent",
    "Every production profile requires an 18+ record and informed publication consent.",
  ],
  [
    EyeOff,
    "Private verification",
    "Legal identities and verification evidence stay access-controlled and never appear publicly.",
  ],
  [
    Flag,
    "Report and takedown",
    "Visitors can report suspected abuse, stolen media, impersonation or unlawful content.",
  ],
  [
    ShieldCheck,
    "Independent verification",
    "Visitors should verify advertisers and claims before sharing data or making decisions.",
  ],
] as const;
export default function SafetyPage() {
  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Safety" }]} />
        <div className="max-w-4xl">
          <h1 className="font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
            Safety and privacy by design
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted">
            Technical controls support safer publishing, but no badge replaces personal judgment,
            clear consent, accurate identity checks or compliance with law.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {principles.map(([Icon, title, copy]) => (
            <article key={title} className="surface-border rounded-[22px] bg-surface p-7">
              <Icon className="text-gold" size={30} />
              <h2 className="mt-8 font-display text-2xl font-bold">{title}</h2>
              <p className="mt-4 leading-7 text-muted">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
