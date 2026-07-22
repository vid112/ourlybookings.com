import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProfileCard } from "@/components/profile-card";
import { categories, indiaStates } from "@/data/india";
import { getDirectoryLocations, getDirectoryProfiles } from "@/lib/directory";

export const metadata: Metadata = {
  title: "Independent Profiles Across India",
  description: "Browse adult profiles by Indian state, city and category on Ourly Bookings.",
  alternates: { canonical: "/profiles" },
};

type ProfilesPageProps = {
  searchParams: Promise<{ state?: string; city?: string; category?: string }>;
};

export default async function ProfilesPage({ searchParams }: ProfilesPageProps) {
  const filters = await searchParams;
  const [apiLocations, profiles] = await Promise.all([
    getDirectoryLocations(),
    getDirectoryProfiles(filters),
  ]);
  const locations = apiLocations?.length ? apiLocations : indiaStates;
  const selectedState = locations.find((state) => state.slug === filters.state);
  const hasLiveProfiles = profiles.some((profile) => !profile.isDemo);

  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Profiles" }]} />
        <div className="max-w-4xl">
          <h1 className="text-balance font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
            Independent profiles across India
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted">
            Filter listings by location and category. Every published record passes the admin
            workflow for adult status, source evidence, consent, media and location.
          </p>
        </div>
        <form
          className="surface-border mt-12 grid gap-3 rounded-[20px] bg-surface p-4 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto]"
          action="/profiles"
        >
          <select
            name="state"
            defaultValue={filters.state ?? ""}
            className="min-h-12 rounded-xl border border-white/12 bg-surface-2 px-4"
          >
            <option value="">All states</option>
            {locations.map((state) => (
              <option key={state.slug} value={state.slug}>
                {state.name}
              </option>
            ))}
          </select>
          <select
            name="city"
            defaultValue={filters.city ?? ""}
            className="min-h-12 rounded-xl border border-white/12 bg-surface-2 px-4"
          >
            <option value="">All cities</option>
            {selectedState?.cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
          <select
            name="category"
            defaultValue={filters.category ?? ""}
            className="min-h-12 rounded-xl border border-white/12 bg-surface-2 px-4"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>
          <button type="submit" className="brand-gradient min-h-12 rounded-xl px-6 font-bold">
            Apply filters
          </button>
        </form>
        <div className="mt-10 flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Showing {profiles.length} {hasLiveProfiles ? "published" : "demo"}{" "}
            {profiles.length === 1 ? "profile" : "profiles"}
          </p>
          {filters.state || filters.city || filters.category ? (
            <Link href="/profiles" className="text-sm font-bold text-brand">
              Clear filters
            </Link>
          ) : null}
        </div>
        {profiles.length ? (
          <section className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.slice(0, 48).map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </section>
        ) : (
          <div className="mt-8 rounded-[24px] border border-dashed border-white/15 p-10 text-center text-muted">
            No published profiles match these filters yet.
          </div>
        )}
      </div>
    </div>
  );
}
