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
  const title = `Independent Profiles in ${cityName}, ${stateName}`;
  return {
    title,
    description: `Browse adult profiles and location information for ${cityName}, ${stateName} on Ourly Bookings.`,
    alternates: { canonical: `/india/${stateSlug}/${citySlug}` },
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

  return (
    <div className="section-space">
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
          <h1 className="text-balance font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
            Independent profiles in {city.name}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted">
            Browse published adult profile previews for {city.name}, {state.name}. Profiles keep
            their source evidence and are managed from the Ourly admin panel.
          </p>
        </div>
        {profiles.length ? (
          <section className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </section>
        ) : (
          <div className="mt-14 rounded-[24px] border border-dashed border-white/15 p-10 text-muted">
            This city is ready, but it has no published profile yet.
          </div>
        )}
        <section className="mt-20 grid gap-8 border-t border-white/12 pt-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">Browse with privacy in mind</h2>
            <p className="mt-5 leading-8 text-muted">
              Limit personal information, verify claims independently and never proceed when consent
              or identity is unclear.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold">Explore nearby city pages</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {state.cities
                .filter((item) => item.slug !== city.slug)
                .slice(0, 8)
                .map((item) => (
                  <Link
                    key={item.slug}
                    href={`/india/${state.slug}/${item.slug}`}
                    className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-muted hover:text-paper"
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
