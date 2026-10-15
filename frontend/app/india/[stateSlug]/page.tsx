import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getState, indiaStates } from "@/data/india";
import { getDirectoryLocation, getDirectoryProfiles } from "@/lib/directory";
import { ProfileCard } from "@/components/profile-card";

type StatePageProps = { params: Promise<{ stateSlug: string }> };

export function generateStaticParams() {
  return indiaStates.map((state) => ({ stateSlug: state.slug }));
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { stateSlug } = await params;
  const apiState = await getDirectoryLocation(stateSlug);
  const fallbackState = getState(stateSlug);
  const state = apiState ?? fallbackState;

  if (!state) return {};

  const currentYear = new Date().getFullYear();
  const title = `Top Call Girls & Escorts in ${state.name} (${currentYear}) - Verified City Directory`;
  const description = `Discover independent call girls, adult escorts, and massage services across all major cities in ${state.name}. Browse genuine photos, direct contact details, and verified profiles.`;

  return {
    title,
    description,
    keywords: [
      `call girls in ${state.name}`,
      `escorts in ${state.name}`,
      `${state.name} adult companionship`,
      `independent escorts ${state.name}`,
    ],
    alternates: { canonical: `/india/${stateSlug}` },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function StatePage({ params }: StatePageProps) {
  const { stateSlug } = await params;
  const [apiState, stateProfiles] = await Promise.all([
    getDirectoryLocation(stateSlug),
    getDirectoryProfiles({ state: stateSlug }),
  ]);
  const fallbackState = getState(stateSlug);
  const state = apiState ?? fallbackState;

  if (!state) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Call Girls & Escorts in ${state.name}`,
    description: `Directory of verified independent escorts and adult companionship across ${state.name}.`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ourlybookings.com" },
        { "@type": "ListItem", "position": 2, "name": "India", "item": "https://ourlybookings.com/india" },
        { "@type": "ListItem", "position": 3, "name": state.name, "item": `https://ourlybookings.com/india/${state.slug}` },
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
            { label: "India", href: "/india" },
            { label: state.name },
          ]}
        />

        <div className="max-w-4xl">
          <h1 className="text-balance font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Verified Call Girls & Escorts in {state.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Select your city in {state.name} below to browse local independent companions, verified listings, and direct contact options.
          </p>
        </div>

        {/* Major Cities Direct Link Hub (The SEO Anchor Silo) */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold text-paper">Select a City in {state.name}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {state.cities.map((city) => (
              <Link
                key={city.slug}
                href={`/india/${state.slug}/${city.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-white/30 hover:bg-white/[0.08]"
              >
                <span className="font-semibold text-white group-hover:text-primary">{city.name}</span>
                <span className="mt-1 text-xs text-muted">Call Girls & Escorts &rarr;</span>
              </Link>
            ))}
          </div>
        </section>

        {/* State Recent Profiles */}
        {stateProfiles.length > 0 && (
          <section className="mt-16 border-t border-white/12 pt-12">
            <h2 className="font-display text-2xl font-bold">Featured Listings in {state.name}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stateProfiles.slice(0, 6).map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          </section>
        )}

        {/* State SEO Narrative Content */}
        <section className="mt-20 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-muted">
          <h2 className="font-display text-xl font-bold text-paper">
            About Adult Companionship & Escort Services in {state.name}
          </h2>
          <p className="mt-3 text-sm leading-relaxed">
            Ourly Bookings connects consenting adults directly with verified, independent companions across {state.name}. Every city page offers filtered listings, transparent rates, and direct communication channels. We prohibit third-party agency exploitation and mandate strict verification standards.
          </p>
        </section>
      </div>
    </div>
  );
}
