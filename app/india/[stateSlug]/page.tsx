import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProfileCard } from "@/components/profile-card";
import { getProfilesByState, getState, indiaStates } from "@/data/india";
import { absoluteUrl } from "@/lib/site";

type StatePageProps = { params: Promise<{ stateSlug: string }> };

export function generateStaticParams() {
  return indiaStates.map((state) => ({ stateSlug: state.slug }));
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { stateSlug } = await params;
  const state = getState(stateSlug);
  if (!state) return {};
  const title = `Independent Profiles in ${state.name}`;
  const description = `Browse city-based adult demo profiles across ${state.name}. ${state.summary}`;
  return {
    title,
    description,
    alternates: { canonical: `/india/${state.slug}` },
    openGraph: { title, description, url: `/india/${state.slug}` },
  };
}

export default async function StatePage({ params }: StatePageProps) {
  const { stateSlug } = await params;
  const state = getState(stateSlug);
  if (!state) notFound();
  const profiles = getProfilesByState(state.slug);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "India", item: absoluteUrl("/india") },
      {
        "@type": "ListItem",
        position: 3,
        name: state.name,
        item: absoluteUrl(`/india/${state.slug}`),
      },
    ],
  };

  return (
    <div className="section-space">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="site-container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "India", href: "/india" },
            { label: state.name },
          ]}
        />
        <div className="grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-brand">
              {state.type}
            </p>
            <h1 className="text-balance font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
              Independent profiles in {state.name}
            </h1>
          </div>
          <p className="text-lg leading-8 text-muted">
            {state.summary} Browse by city below. All current records are clearly marked fictional
            demo content.
          </p>
        </div>
        <section className="mt-16 border-y border-white/12 py-8">
          <h2 className="font-display text-2xl font-bold">Choose a city in {state.name}</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {state.cities.map((stateCity) => (
              <Link
                key={stateCity.slug}
                href={`/india/${state.slug}/${stateCity.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface px-4 py-3 text-sm font-bold text-muted hover:border-brand/50 hover:text-paper"
              >
                <MapPin size={15} className="text-brand" />
                {stateCity.name}
              </Link>
            ))}
          </div>
        </section>
        <section className="mt-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.04em]">
                Profiles by city
              </h2>
              <p className="mt-3 text-muted">
                One fictional profile is provided for each listed city to verify routing and CMS
                relationships.
              </p>
            </div>
            <Link
              href={`/profiles?state=${state.slug}`}
              className="hidden font-bold text-brand sm:block"
            >
              View filtered directory →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </section>
        <section className="mt-20 max-w-3xl border-t border-white/12 pt-12">
          <h2 className="font-display text-3xl font-bold">Using this {state.name} directory</h2>
          <p className="mt-5 leading-8 text-muted">
            Location pages are designed for useful local navigation, not keyword-stuffed doorway
            pages. New city pages should be published only after a verified profile, original
            introduction, useful safety information and accurate metadata are ready.
          </p>
        </section>
      </div>
    </div>
  );
}
