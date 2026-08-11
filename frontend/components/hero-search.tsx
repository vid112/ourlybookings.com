"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Country = {
  id: string;
  name: string;
  slug: string;
  states: {
    id?: string;
    name: string;
    slug: string;
    cities: readonly { name: string; slug: string }[];
  }[];
};
type Category = { id: string; name: string; slug: string };

export function HeroSearch({
  countries,
  categories,
}: {
  countries: readonly Country[];
  categories: readonly Category[];
}) {
  const router = useRouter();
  const [countrySlug, setCountrySlug] = useState("");
  const [stateSlug, setStateSlug] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const selectedCountry = useMemo(
    () => countries.find((country) => country.slug === countrySlug),
    [countries, countrySlug],
  );
  const selectedState = selectedCountry?.states.find((state) => state.slug === stateSlug);
  return (
    <form
      className="glass-surface grid gap-3 rounded-2xl p-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        const query = new URLSearchParams();
        if (categorySlug) query.set("category", categorySlug);
        if (countrySlug) query.set("country", countrySlug);
        if (stateSlug) query.set("state", stateSlug);
        if (citySlug) query.set("city", citySlug);
        router.push(`/profiles?${query.toString()}`);
      }}
      aria-label="Find profiles worldwide"
    >
      <select
        aria-label="Category"
        value={categorySlug}
        onChange={(event) => setCategorySlug(event.target.value)}
        className={heroField}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Country"
        value={countrySlug}
        onChange={(event) => {
          setCountrySlug(event.target.value);
          setStateSlug("");
          setCitySlug("");
        }}
        className={heroField}
      >
        <option value="">All countries</option>
        {countries.map((country) => (
          <option key={country.id} value={country.slug}>
            {country.name}
          </option>
        ))}
      </select>
      <select
        aria-label="State or region"
        value={stateSlug}
        onChange={(event) => {
          setStateSlug(event.target.value);
          setCitySlug("");
        }}
        disabled={!selectedCountry}
        className={heroField}
      >
        <option value="">All regions</option>
        {selectedCountry?.states.map((state) => (
          <option key={state.slug} value={state.slug}>
            {state.name}
          </option>
        ))}
      </select>
      <select
        aria-label="City"
        value={citySlug}
        onChange={(event) => setCitySlug(event.target.value)}
        disabled={!selectedState}
        className={heroField}
      >
        <option value="">All cities</option>
        {selectedState?.cities.map((city) => (
          <option key={city.slug} value={city.slug}>
            {city.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="brand-gradient inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white"
      >
        <Search size={17} /> Search
      </button>
    </form>
  );
}

const heroField =
  "min-h-12 rounded-xl border border-white/12 bg-surface-2 px-4 text-sm text-paper disabled:cursor-not-allowed disabled:opacity-55";
