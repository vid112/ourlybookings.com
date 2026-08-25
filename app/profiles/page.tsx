import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProfileListItem } from "@/components/profile-list-item";
import { getDirectoryOptions, getDirectoryProfiles } from "@/lib/directory";

export const metadata: Metadata = {
  title: "Independent Profiles Worldwide",
  description:
    "Browse adult advertisements by country, region, city, category and profile filters.",
  alternates: { canonical: "/profiles" },
};

type Filters = {
  q?: string;
  country?: string;
  state?: string;
  city?: string;
  area?: string;
  category?: string;
  service?: string;
  gender?: string;
  ethnicity?: string;
  nationality?: string;
  bust?: string;
  hair?: string;
  bodyType?: string;
  attentionTo?: string;
  placeOfService?: string;
};

export default async function ProfilesPage({ searchParams }: { searchParams: Promise<Filters> }) {
  const filters = await searchParams;
  const [options, profiles] = await Promise.all([
    getDirectoryOptions(),
    getDirectoryProfiles(filters),
  ]);
  const selectedCountry = options?.countries.find((country) => country.slug === filters.country);
  const selectedState = selectedCountry?.states.find((state) => state.slug === filters.state);
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Profiles" }]} />
        <div className="max-w-4xl">
          <h1 className="text-balance font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
            All independent posts
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted">
            Search and scroll through every approved listing by country, city and category. Every
            public record has completed the admin moderation workflow.
          </p>
        </div>
        <form
          className="surface-border mt-12 grid gap-3 rounded-[20px] bg-surface p-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto]"
          action="/profiles"
        >
          <input
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Name or keyword"
            className={filterClass}
          />
          <select name="country" defaultValue={filters.country ?? ""} className={filterClass}>
            <option value="">All countries</option>
            {options?.countries.map((country) => (
              <option key={country.id} value={country.slug}>
                {country.name}
              </option>
            ))}
          </select>
          <select
            name="state"
            defaultValue={filters.state ?? ""}
            className={filterClass}
            disabled={!selectedCountry}
          >
            <option value="">All regions</option>
            {selectedCountry?.states.map((state) => (
              <option key={state.id} value={state.slug}>
                {state.name}
              </option>
            ))}
          </select>
          <select
            name="city"
            defaultValue={filters.city ?? ""}
            className={filterClass}
            disabled={!selectedState}
          >
            <option value="">All cities</option>
            {selectedState?.cities.map((city) => (
              <option key={city.id} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
          <select name="category" defaultValue={filters.category ?? ""} className={filterClass}>
            <option value="">All categories</option>
            {options?.categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <button type="submit" className="brand-gradient min-h-12 rounded-xl px-6 font-bold">
            Search
          </button>
        </form>
        <div className="mt-10 flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Showing {profiles.length} published {profiles.length === 1 ? "profile" : "profiles"}
          </p>
          {hasFilters ? (
            <Link href="/profiles" className="text-sm font-bold text-brand">
              Clear filters
            </Link>
          ) : null}
        </div>
        {profiles.length ? (
          <section className="mt-8 space-y-4 sm:space-y-5">
            {profiles.map((profile) => (
              <ProfileListItem key={profile.id} profile={profile} />
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

const filterClass =
  "min-h-12 rounded-xl border border-white/12 bg-surface-2 px-4 text-paper disabled:opacity-45";
