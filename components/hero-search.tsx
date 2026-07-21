"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type SearchState = {
  name: string;
  slug: string;
  cities: readonly { name: string; slug: string }[];
};

export function HeroSearch({ states }: { states: readonly SearchState[] }) {
  const router = useRouter();
  const [stateSlug, setStateSlug] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const selectedState = useMemo(
    () => states.find((state) => state.slug === stateSlug),
    [stateSlug, states],
  );

  return (
    <form
      className="glass-surface grid gap-3 rounded-2xl p-3 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        if (!stateSlug) {
          router.push("/profiles");
          return;
        }
        router.push(citySlug ? `/india/${stateSlug}/${citySlug}` : `/india/${stateSlug}`);
      }}
      aria-label="Find profiles by location"
    >
      <label className="sr-only" htmlFor="category">
        Category
      </label>
      <select
        id="category"
        className="min-h-12 rounded-xl border border-white/12 bg-surface-2 px-4 text-sm text-paper"
      >
        <option>All categories</option>
        <option>Independent</option>
        <option>Model</option>
        <option>VIP</option>
        <option>College</option>
        <option>Massage</option>
      </select>
      <label className="sr-only" htmlFor="state">
        State
      </label>
      <select
        id="state"
        value={stateSlug}
        onChange={(event) => {
          setStateSlug(event.target.value);
          setCitySlug("");
        }}
        className="min-h-12 rounded-xl border border-white/12 bg-surface-2 px-4 text-sm text-paper"
      >
        <option value="">Select state</option>
        {states.map((state) => (
          <option key={state.slug} value={state.slug}>
            {state.name}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="city">
        City
      </label>
      <select
        id="city"
        value={citySlug}
        onChange={(event) => setCitySlug(event.target.value)}
        disabled={!selectedState}
        className="min-h-12 rounded-xl border border-white/12 bg-surface-2 px-4 text-sm text-paper disabled:cursor-not-allowed disabled:opacity-55"
      >
        <option value="">Select city</option>
        {selectedState?.cities.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="brand-gradient inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white"
      >
        <Search size={17} aria-hidden="true" /> Search
      </button>
    </form>
  );
}
