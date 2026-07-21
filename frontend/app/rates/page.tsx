import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
export const metadata: Metadata = {
  title: "Rates and Enquiry Information",
  description: "How independent advertisers control pricing notes and enquiry expectations.",
  alternates: { canonical: "/rates" },
};
export default function RatesPage() {
  return (
    <div className="section-space">
      <div className="site-container max-w-4xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Rates" }]} />
        <h1 className="font-display text-5xl font-bold tracking-[-0.055em]">
          Rates and enquiry information
        </h1>
        <p className="mt-7 text-lg leading-8 text-muted">
          Ourly Bookings does not set prices, collect payment or participate in private
          arrangements. Each verified advertiser controls any legally reviewed pricing note shown on
          their profile.
        </p>
        <div className="surface-border mt-12 rounded-[24px] bg-surface p-8">
          <h2 className="font-display text-2xl font-bold">Before contacting an advertiser</h2>
          <ul className="mt-6 list-disc space-y-3 pl-5 leading-7 text-muted">
            <li>Confirm identity, terms and availability directly.</li>
            <li>Never send money when details, consent or identity are unclear.</li>
            <li>Do not treat a platform verification badge as a service guarantee.</li>
            <li>Report pressure, coercion, impersonation or suspicious payment requests.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
