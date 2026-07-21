import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProfileCard } from "@/components/profile-card";
import { getCity, getProfilesByCity, getState, indiaStates } from "@/data/india";

type CityPageProps = { params: Promise<{ stateSlug: string; citySlug: string }> };

export function generateStaticParams() {
  return indiaStates.flatMap((state) =>
    state.cities.map((stateCity) => ({ stateSlug: state.slug, citySlug: stateCity.slug })),
  );
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { stateSlug, citySlug } = await params;
  const state = getState(stateSlug);
  const stateCity = getCity(stateSlug, citySlug);
  if (!state || !stateCity) return {};
  const title = `Independent Profiles in ${stateCity.name}, ${state.name}`;
  const description = `Explore fictional adult demo profiles for ${stateCity.name}, plus privacy, consent and city-specific browsing information.`;
  return {
    title,
    description,
    alternates: { canonical: `/india/${state.slug}/${stateCity.slug}` },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { stateSlug, citySlug } = await params;
  const state = getState(stateSlug);
  const stateCity = getCity(stateSlug, citySlug);
  if (!state || !stateCity) notFound();
  const profiles = getProfilesByCity(state.slug, stateCity.slug);

  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "India", href: "/india" },
            { label: state.name, href: `/india/${state.slug}` },
            { label: stateCity.name },
          ]}
        />
        <div className="max-w-4xl">
          <h1 className="text-balance font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
            Independent profiles in {stateCity.name}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted">
            Browse independently managed adult profile previews for {stateCity.name}, {state.name}.
            The current listing is fictional demo data used to validate this city template and
            publishing workflow.
          </p>
        </div>
        <section className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </section>
        <section className="mt-20 grid gap-8 border-t border-white/12 pt-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">Browse with privacy in mind</h2>
            <p className="mt-5 leading-8 text-muted">
              Use platform messaging and direct contact carefully, limit personal information,
              verify claims independently and never proceed when consent or identity is unclear.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold">Explore nearby city pages</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {state.cities
                .filter((item) => item.slug !== stateCity.slug)
                .slice(0, 6)
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
