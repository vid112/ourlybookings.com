import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProfileCard } from "@/components/profile-card";
import { getCity, getProfilesByCity, getState, indiaStates } from "@/data/india";
import { getDirectoryLocation, getDirectoryProfiles } from "@/lib/directory";

type CityPageProps = { params: Promise<{ stateSlug: string; citySlug: string }> };

export function generateStaticParams() {
  return indiaStates.flatMap((state) =>
    state.cities.map((city) => ({ stateSlug: state.slug, citySlug: city.slug })),
  );
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { stateSlug, citySlug } = await params;
  const apiState = await getDirectoryLocation(stateSlug);
  const fallbackState = getState(stateSlug);
  const stateName = apiState?.name ?? fallbackState?.name;
  const cityName =
    apiState?.cities.find((city) => city.slug === citySlug)?.name ??
    getCity(stateSlug, citySlug)?.name;

  if (!stateName || !cityName) return {};

  const currentYear = new Date().getFullYear();
  const title = `Best Call Girls in ${cityName}, ${stateName} (${currentYear}) - Verified Escort Services`;
  const description = `Find verified independent call girls and top escort services in ${cityName}, ${stateName}. Browse real photos, WhatsApp contact, verified reviews, and 24/7 incall/outcall availability.`;

  return {
    title,
    description,
    keywords: [
      `call girls in ${cityName}`,
      `escorts in ${cityName}`,
      `${cityName} call girl service`,
      `independent escorts ${cityName}`,
      `massage service in ${cityName}`,
    ],
    alternates: { canonical: `/india/${stateSlug}/${citySlug}` },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { stateSlug, citySlug } = await params;
  const [apiState, apiProfiles] = await Promise.all([
    getDirectoryLocation(stateSlug),
    getDirectoryProfiles({ state: stateSlug, city: citySlug }),
  ]);
  const fallbackState = getState(stateSlug);
  const state = apiState ?? fallbackState;
  const city = state?.cities.find((item) => item.slug === citySlug) ?? getCity(stateSlug, citySlug);

  if (!state || !city) notFound();

  const profiles = apiProfiles.length
    ? apiProfiles
    : getProfilesByCity(stateSlug, citySlug).map((profile) => ({
        ...profile,
        shortBio: profile.shortBio,
        fullBio: profile.fullBio,
        image: profile.image,
        imageAlt: profile.imageAlt,
        images: [{ url: profile.image, alt: profile.imageAlt }],
        services: [],
        isDemo: true,
      }));

  const popularCategories = [
    { name: "Call Girls", slug: "call-girls-service" },
    { name: "Escort Services", slug: "escort-services" },
    { name: "Girls Massage", slug: "girls-massage-services" },
    { name: "Male Escorts / Gigolo", slug: "gigolo-services" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Call Girls & Escort Services in ${city.name}`,
    description: `Directory of independent verified companions and escort services in ${city.name}, ${state.name}.`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ourlybookings.com" },
        { "@type": "ListItem", "position": 2, "name": "India", "item": "https://ourlybookings.com/india" },
        { "@type": "ListItem", "position": 3, "name": state.name, "item": `https://ourlybookings.com/india/${state.slug}` },
        { "@type": "ListItem", "position": 4, "name": city.name, "item": `https://ourlybookings.com/india/${state.slug}/${city.slug}` },
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
            { label: state.name, href: `/india/${state.slug}` },
            { label: city.name },
          ]}
        />

        <div className="max-w-4xl">
          <h1 className="text-balance font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Verified Call Girls & Escorts in {city.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Explore verified independent profiles, genuine photo listings, and 24/7 direct contact
            for adult companionship, dinner dates, and massage services in {city.name}, {state.name}.
          </p>

          {/* Quick Category Badges for SEO Sitelinks */}
          <div className="mt-6 flex flex-wrap gap-2">
            {popularCategories.map((cat) => (
              <span
                key={cat.slug}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-paper"
              >
                {cat.name} in {city.name}
              </span>
            ))}
          </div>
        </div>

        {profiles.length ? (
          <section className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </section>
        ) : (
          <div className="mt-12 rounded-[24px] border border-dashed border-white/15 p-10 text-muted">
            New listings for {city.name} are currently being verified by administrators. Check back soon.
          </div>
        )}

        {/* SEO Silo Linking Section */}
        <section className="mt-20 grid gap-8 border-t border-white/12 pt-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold">Safe & Verified Booking Guide in {city.name}</h2>
            <p className="mt-4 leading-7 text-muted">
              Always verify profile photos, insist on direct call or WhatsApp confirmation, and never pay upfront deposits to unverified contacts. Independent companions manage their own schedules and bookings directly.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">Other Major Cities in {state.name}</h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {state.cities
                .filter((item) => item.slug !== city.slug)
                .slice(0, 10)
                .map((item) => (
                  <Link
                    key={item.slug}
                    href={`/india/${state.slug}/${item.slug}`}
                    className="rounded-xl border border-white/15 px-3.5 py-2 text-xs font-semibold text-muted transition hover:border-white/30 hover:text-white"
                  >
                    {item.name} Escorts
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
