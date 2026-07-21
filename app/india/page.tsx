import type { Metadata } from "next";
import { ArrowRight, MapPinned } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { indiaStates } from "@/data/india";

export const metadata: Metadata = {
  title: "Browse Independent Profiles by Indian State and City",
  description:
    "Explore all Indian states, union territories and supported cities through server-rendered location pages.",
  alternates: { canonical: "/india" },
};

export default function IndiaPage() {
  const states = indiaStates.filter((item) => item.type === "State");
  const territories = indiaStates.filter((item) => item.type === "Union territory");

  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "India" }]} />
        <div className="max-w-3xl">
          <h1 className="text-balance font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
            Explore profiles across India
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted">
            Choose a state or union territory to see its supported cities and fictional demo
            profiles. Production location pages are published only when they contain verified
            profiles and useful unique content.
          </p>
        </div>
        <LocationGroup title="States" locations={states} />
        <LocationGroup title="Union territories" locations={territories} />
      </div>
    </div>
  );
}

function LocationGroup({ title, locations }: { title: string; locations: typeof indiaStates }) {
  return (
    <section className="mt-20">
      <h2 className="font-display text-3xl font-bold tracking-[-0.04em]">{title}</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Link
            key={location.slug}
            href={`/india/${location.slug}`}
            className="group surface-border rounded-[22px] bg-surface p-6 transition hover:-translate-y-1 hover:border-brand/45"
          >
            <div className="flex items-start justify-between gap-6">
              <MapPinned className="text-brand" />
              <ArrowRight
                className="text-muted transition group-hover:translate-x-1 group-hover:text-brand"
                size={19}
              />
            </div>
            <h3 className="mt-8 font-display text-2xl font-bold tracking-[-0.04em]">
              {location.name}
            </h3>
            <p className="mt-3 line-clamp-2 leading-6 text-muted">{location.summary}</p>
            <p className="mt-5 text-sm font-bold text-paper">
              {location.cities.length} {location.cities.length === 1 ? "city" : "cities"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
