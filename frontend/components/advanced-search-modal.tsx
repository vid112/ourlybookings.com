"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
type City = {
  id: string;
  name: string;
  slug: string;
  areas: { id: string; name: string; slug: string }[];
};
type State = { id: string; name: string; slug: string; cities: City[] };
type Country = { id: string; name: string; slug: string; states: State[] };
type Option = { id: string; name: string; slug: string };
type Options = { countries: Country[]; categories: Option[]; services: Option[] };

export function AdvancedSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [options, setOptions] = useState<Options>({ countries: [], categories: [], services: [] });
  const [countrySlug, setCountrySlug] = useState("");
  const [stateSlug, setStateSlug] = useState("");
  const [citySlug, setCitySlug] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch(`${apiUrl}/public/ad-options`)
      .then((response) => response.json())
      .then((payload: Options) => setOptions(payload))
      .catch(() => undefined);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, open]);

  const states = useMemo(
    () => options.countries.find((country) => country.slug === countrySlug)?.states ?? [],
    [countrySlug, options.countries],
  );
  const cities = states.find((state) => state.slug === stateSlug)?.cities ?? [];
  const areas = cities.find((city) => city.slug === citySlug)?.areas ?? [];
  if (!open) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget).entries()) {
      const normalized = String(value).trim();
      if (normalized) query.set(key, normalized);
    }
    onClose();
    router.push(`/profiles?${query.toString()}`);
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-start overflow-y-auto bg-black/75 p-0 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
        className="mx-auto min-h-screen w-full max-w-5xl bg-white text-[#181818] shadow-2xl sm:min-h-0 sm:rounded-[24px]"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 id="search-title" className="flex items-center gap-3 text-2xl font-bold">
            <Search /> Search
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full hover:bg-stone-100"
            aria-label="Close search"
          >
            <X />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 sm:p-7">
          <div className="grid gap-3 md:grid-cols-2">
            <select name="category" className={searchField}>
              <option value="">All Categories</option>
              {options.categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <input name="q" className={searchField} placeholder="Search by name or keyword…" />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <select
              name="country"
              value={countrySlug}
              onChange={(event) => {
                setCountrySlug(event.target.value);
                setStateSlug("");
                setCitySlug("");
              }}
              className={searchField}
            >
              <option value="">All Countries</option>
              {options.countries.map((country) => (
                <option key={country.id} value={country.slug}>
                  {country.name}
                </option>
              ))}
            </select>
            <select
              name="state"
              value={stateSlug}
              onChange={(event) => {
                setStateSlug(event.target.value);
                setCitySlug("");
              }}
              disabled={!countrySlug}
              className={searchField}
            >
              <option value="">All Regions / States</option>
              {states.map((state) => (
                <option key={state.id} value={state.slug}>
                  {state.name}
                </option>
              ))}
            </select>
            <select
              name="city"
              value={citySlug}
              onChange={(event) => setCitySlug(event.target.value)}
              disabled={!stateSlug}
              className={searchField}
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>
            <select name="area" disabled={!citySlug} className={searchField}>
              <option value="">All Areas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.slug}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          <h3 className="mt-8 flex items-center gap-3 border-b border-stone-200 pb-4 text-xl font-bold text-stone-600">
            <SlidersHorizontal size={20} /> Filters
          </h3>
          <div className="divide-y divide-stone-200">
            <FilterSelect
              label="Gender"
              name="gender"
              options={["Woman", "Man", "Trans Woman", "Trans Man", "Non-binary"]}
            />
            <FilterInput label="Ethnicity" name="ethnicity" placeholder="Any ethnicity" />
            <FilterInput label="Nationality" name="nationality" placeholder="Any nationality" />
            <FilterInput label="Bust" name="bust" placeholder="Any" />
            <FilterInput label="Hair" name="hair" placeholder="Any hair color" />
            <FilterSelect
              label="Body Type"
              name="bodyType"
              options={["Slim", "Athletic", "Average", "Curvy", "Plus Size"]}
            />
            <FilterSelect
              label="Services"
              name="service"
              options={options.services.map((item) => item.name)}
              values={options.services.map((item) => item.slug)}
            />
            <FilterSelect
              label="Attention To"
              name="attentionTo"
              options={["Men", "Women", "Couples", "Everyone"]}
            />
            <FilterSelect
              label="Place Of Service"
              name="placeOfService"
              options={["Incalls", "Outcalls", "Incalls and Outcalls", "Online"]}
            />
          </div>
          <div className="mt-7 grid gap-3 border-t border-stone-200 pt-5 sm:grid-cols-[0.8fr_1.2fr]">
            <button
              type="reset"
              onClick={() => {
                setCountrySlug("");
                setStateSlug("");
                setCitySlug("");
              }}
              className="min-h-14 rounded-xl font-bold text-[#c64130]"
            >
              DELETE ALL
            </button>
            <button className="flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#d53f2c] px-6 text-lg font-bold text-white">
              <Search /> SEARCH
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FilterSelect({
  label,
  name,
  options,
  values,
}: {
  label: string;
  name: string;
  options: string[];
  values?: string[];
}) {
  return (
    <label className="grid items-center gap-3 py-4 sm:grid-cols-[220px_1fr]">
      <span className="flex items-center gap-3 font-semibold">
        {label}
        <ChevronDown className="ml-auto text-[#d53f2c] sm:hidden" />
      </span>
      <select name={name} className={searchField}>
        <option value="">Any</option>
        {options.map((option, index) => (
          <option key={option} value={values?.[index] ?? option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
function FilterInput({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className="grid items-center gap-3 py-4 sm:grid-cols-[220px_1fr]">
      <span className="font-semibold">{label}</span>
      <input name={name} placeholder={placeholder} className={searchField} />
    </label>
  );
}
const searchField =
  "min-h-12 w-full rounded-lg border border-stone-300 bg-white px-4 text-[#181818] disabled:bg-stone-100 disabled:text-stone-400";
