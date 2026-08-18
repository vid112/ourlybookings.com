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
      <div className="section-space bg-[radial-gradient(circle_at_top_left,rgba(214,79,123,0.16),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(182,65,49,0.12),transparent_26%),linear-gradient(180deg,#100d12,#171219_55%,#0d0b0f)] text-white">
        <div className="site-container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Post Your Ad" }]} />
          <div>
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-balance font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
                Post a lawful adult advertisement
              </h1>
              <p className="mt-6 text-lg leading-8 text-white/65">
                Every submission is reviewed before publication. No listing is published until adult
                verification, consent and media rights are recorded.
              </p>
              <ul className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm leading-6 text-white/60">
                {requirements.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3">
                    <Icon className="text-[#f06a91]" size={20} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mx-auto mt-10 max-w-5xl">
              <AdvertiserPortal />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
