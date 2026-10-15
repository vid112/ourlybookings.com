import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { indiaStates } from "@/data/india";
import { siteConfig } from "@/lib/site";

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: `Call Girls in India - Top Escort Services & Adult Classifieds Directory (${currentYear})`,
  description: `Browse 100% verified call girls, independent escorts, and adult companionship services across all states and cities in India. Direct WhatsApp and phone contact with genuine photos.`,
  keywords: [
    "call girls in india",
    "india escort service",
    "independent call girls",
    "female escorts india",
    "call girl contact number",
    "verified adult classifieds india",
  ],
  alternates: {
    canonical: "/india",
  },
  openGraph: {
    title: `Verified Call Girls & Escorts Directory Across India (${currentYear})`,
    description: `Direct access to independent call girls, out-call & in-call escort services across top Indian metros, states, and cities.`,
    url: `${siteConfig.url}/india`,
    type: "website",
  },
};

const topMetros = [
  { name: "Prayagraj (Allahabad)", stateSlug: "uttar-pradesh", citySlug: "prayagraj" },
  { name: "Noida", stateSlug: "uttar-pradesh", citySlug: "noida" },
  { name: "Delhi NCR", stateSlug: "delhi", citySlug: "new-delhi" },
  { name: "Mumbai", stateSlug: "maharashtra", citySlug: "mumbai" },
  { name: "Bengaluru", stateSlug: "karnataka", citySlug: "bengaluru" },
  { name: "Hyderabad", stateSlug: "telangana", citySlug: "hyderabad" },
  { name: "Pune", stateSlug: "maharashtra", citySlug: "pune" },
  { name: "Kolkata", stateSlug: "west-bengal", citySlug: "kolkata" },
  { name: "Chennai", stateSlug: "tamil-nadu", citySlug: "chennai" },
  { name: "Ahmedabad", stateSlug: "gujarat", citySlug: "ahmedabad" },
  { name: "Jaipur", stateSlug: "rajasthan", citySlug: "jaipur" },
  { name: "Lucknow", stateSlug: "uttar-pradesh", citySlug: "lucknow" },
  { name: "Chandigarh", stateSlug: "chandigarh", citySlug: "chandigarh" },
  { name: "Goa", stateSlug: "goa", citySlug: "north-goa" },
  { name: "Indore", stateSlug: "madhya-pradesh", citySlug: "indore" },
  { name: "Patna", stateSlug: "bihar", citySlug: "patna" },
];

export default function IndiaDirectoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Call Girls & Escort Services in India",
    description: "Comprehensive directory of verified call girls, independent escorts, and adult companionship across India.",
    url: `${siteConfig.url}/india`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "India Directory", item: `${siteConfig.url}/india` },
      ],
    },
  };

  return (
    <div className="section-space">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="site-container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "India Escort Directory" },
          ]}
        />

        <div className="mt-4 border-b border-white/10 pb-8">
          <h1 className="text-balance font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Call Girls & Escort Services in India ({currentYear})
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
            India's most trusted classified directory for independent call girls, adult escorts, and private companionship. Select your city or state below to explore verified photo listings, real WhatsApp contacts, and zero-advance services.
          </p>
        </div>

        {/* Top High-Traffic Metros Hub (Oklute-Style Instant Access) */}
        <section className="mt-8 rounded-2xl border border-brand/30 bg-brand/[0.04] p-5 sm:p-7">
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
            🔥 High-Demand Metro Directories
          </h2>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Direct high-intent links to verified independent companion profiles:
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {topMetros.map((metro) => (
              <Link
                key={metro.citySlug}
                href={`/india/${metro.stateSlug}/${metro.citySlug}`}
                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-black/40 p-3 transition hover:border-brand hover:bg-brand/10"
              >
                <span className="text-xs font-semibold text-white group-hover:text-brand sm:text-sm">
                  Call Girls in {metro.name}
                </span>
                <span className="mt-1 text-[11px] text-muted group-hover:text-white/80">
                  Verified Escorts &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Complete State-by-State Directory Link Tree (Massive Internal Linking) */}
        <section className="mt-12">
          <div className="flex flex-col justify-between gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Browse All Indian States & Cities
              </h2>
              <p className="text-xs text-muted sm:text-sm">
                Explore every state hub and local city classifieds across India:
              </p>
            </div>
            <span className="text-xs font-medium text-brand">
              {indiaStates.length} States & Territories Listed
            </span>
          </div>

          <div className="mt-8 space-y-10">
            {indiaStates.map((state) => (
              <div
                key={state.slug}
                className="rounded-2xl border border-white/10 bg-surface/40 p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <Link
                    href={`/india/${state.slug}`}
                    className="font-display text-lg font-bold text-white transition hover:text-brand sm:text-xl"
                  >
                    {state.name} Escorts & Call Girls
                  </Link>
                  <Link
                    href={`/india/${state.slug}`}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    View All {state.name} Cities &rarr;
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {state.cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/india/${state.slug}/${city.slug}`}
                      className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-muted transition hover:border-brand/50 hover:bg-white/[0.06] hover:text-white"
                    >
                      Call Girls in {city.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEO Contextual Pillar Content (Signals to Google Algorithm) */}
        <section className="mt-16 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-muted sm:p-8">
          <h2 className="font-display text-xl font-bold text-white">
            India's Leading Independent Escort & Call Girl Network
          </h2>
          <p className="mt-3 text-xs leading-relaxed sm:text-sm">
            Ourly Bookings provides an authentic directory designed to connect consenting adults directly with genuine companions across India. Whether you are traveling for business, searching for high-class hotel companions, or looking for relaxing out-call services, our platform prioritizes verified photo media, transparent reviews, and zero tolerance for scams.
          </p>
          <div className="mt-6 grid gap-4 text-xs sm:grid-cols-3 sm:text-sm">
            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
              <h3 className="font-bold text-white">100% Real Verification</h3>
              <p className="mt-1 text-muted">
                Profiles undergo mandatory adult verification checks before publishing to filter out fake listings.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
              <h3 className="font-bold text-white">Zero Advance Scam Policy</h3>
              <p className="mt-1 text-muted">
                Avoid paying advance card fees, hotel deposit bookings, or fake registration charges before direct face-to-face meet.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/20 p-4">
              <h3 className="font-bold text-white">Direct Client Contact</h3>
              <p className="mt-1 text-muted">
                No agents, brokers, or commission middlemen. Connect via direct WhatsApp or phone calls.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
