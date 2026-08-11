import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCategoryLocations } from "@/lib/directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryLocations(slug);
  if (!data) return { title: "Category" };
  return { title: data.category.name, description: data.category.description };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCategoryLocations(slug);
  if (!data) notFound();
  const groups = new Map<string, { country: string; states: Map<string, typeof data.cities> }>();
  for (const city of data.cities) {
    const countryKey = city.state.country.slug;
    const country = groups.get(countryKey) ?? {
      country: city.state.country.name,
      states: new Map(),
    };
    const stateCities = country.states.get(city.state.slug) ?? [];
    stateCities.push(city);
    country.states.set(city.state.slug, stateCities);
    groups.set(countryKey, country);
  }
  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Categories", href: "/#categories" },
            { label: data.category.name },
          ]}
        />
        <div className="max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
            Browse by location
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
            {data.category.name}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted">{data.category.description}</p>
        </div>
        {groups.size ? (
          <div className="mt-12 space-y-10">
            {[...groups.entries()].map(([countrySlug, group]) => (
              <section
                key={countrySlug}
                className="rounded-[24px] border border-white/12 bg-surface p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-3xl font-bold">{group.country}</h2>
                  <Link
                    href={`/profiles?category=${data.category.slug}&country=${countrySlug}`}
                    className="font-bold text-brand"
                  >
                    View all
                  </Link>
                </div>
                <div className="mt-7 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                  {[...group.states.entries()].map(([stateSlug, cities]) => (
                    <div key={stateSlug}>
                      <h3 className="font-bold">{cities[0]?.state.name}</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {cities.map((city) => (
                          <Link
                            key={`${stateSlug}-${city.slug}`}
                            href={`/profiles?category=${data.category.slug}&country=${countrySlug}&state=${stateSlug}&city=${city.slug}`}
                            className="rounded-full border border-white/12 px-3 py-2 text-sm text-muted hover:border-brand hover:text-paper"
                          >
                            {city.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-[24px] border border-dashed border-white/15 p-10 text-center">
            <p className="text-muted">No approved listings are available in this category yet.</p>
            <Link
              href="/post-ad"
              className="brand-gradient mt-6 inline-flex rounded-xl px-6 py-3 font-bold"
            >
              Post the first advert
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
