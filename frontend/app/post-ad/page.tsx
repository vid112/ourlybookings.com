import type { Metadata } from "next";
import { BadgeCheck, FileCheck2, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdvertiserPortal } from "@/components/advertiser-portal";
import { AgeGate } from "@/components/age-gate";

export const metadata: Metadata = {
  title: "Post Your Ad",
  description: "Submit a lawful adult advertisement for verification and editorial review.",
  alternates: { canonical: "/post-ad" },
  robots: { index: false, follow: true },
};

const requirements = [
  { icon: BadgeCheck, label: "Adults 18+ only" },
  { icon: FileCheck2, label: "Original or licensed media only" },
  { icon: ShieldCheck, label: "Consent and takedown workflow" },
] as const;

export default function PostAdPage() {
  return (
    <>
      <AgeGate />
      <div className="section-space">
        <div className="site-container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Post Your Ad" }]} />
          <div>
            <div className="max-w-4xl">
              <h1 className="text-balance font-display text-5xl font-bold tracking-[-0.055em]">
                Post a lawful adult advertisement
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted">
                Every submission is reviewed before publication. No listing is published until adult
                verification, consent and media rights are recorded.
              </p>
              <ul className="mt-9 flex flex-wrap gap-x-8 gap-y-4 text-sm leading-6 text-muted">
                {requirements.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3">
                    <Icon className="text-brand" size={20} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10">
              <AdvertiserPortal />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
