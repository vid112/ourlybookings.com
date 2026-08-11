"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

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
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center overflow-y-auto bg-[#160b10]/80 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
        className="mx-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-white/20 bg-[#fff8f4] text-[#25191a] shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="flex items-center justify-between bg-gradient-to-r from-[#681b2a] via-[#a23231] to-[#d26042] px-5 py-4 text-white">
          <div>
            <h2 id="search-title" className="flex items-center gap-2.5 text-xl font-bold sm:text-2xl">
              <span className="grid size-9 place-items-center rounded-full bg-white/15">
                <Search size={19} />
              </span>
              Find your perfect listing
            </h2>
            <p className="mt-1 hidden text-sm text-white/75 sm:block">
              Search by service, location and preference
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label="Close search"
          >
            <X />
          </button>
        </div>
        <form onSubmit={submit} className="overflow-y-auto p-4 sm:p-5">
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
          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            aria-expanded={filtersOpen}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-[#c76a58]/25 bg-[#f6e8e1] px-4 py-3 font-bold text-[#7b2930] transition hover:bg-[#f1ddd3]"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal size={18} /> More filters
            </span>
            <ChevronDown
              size={19}
              className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            />
          </button>
          {filtersOpen ? (
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
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
          ) : null}
          <div className="mt-4 grid gap-3 border-t border-[#c76a58]/20 pt-4 sm:grid-cols-[0.7fr_1.3fr]">
            <button
              type="reset"
              onClick={() => {
                setCountrySlug("");
                setStateSlug("");
                setCitySlug("");
              }}
              className="min-h-11 rounded-xl font-bold text-[#a43635] transition hover:bg-[#f2e2dc]"
            >
              Clear all
            </button>
            <button className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8f2630] to-[#d24d35] px-6 font-bold text-white shadow-lg shadow-[#9d2f31]/20 transition hover:brightness-110">
              <Search size={18} /> Search listings
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
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
    <label className="grid gap-1.5 rounded-xl border border-[#c76a58]/15 bg-white/75 p-3">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#71343a]">
        {label}
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
    <label className="grid gap-1.5 rounded-xl border border-[#c76a58]/15 bg-white/75 p-3">
      <span className="text-xs font-bold uppercase tracking-wide text-[#71343a]">{label}</span>
      <input name={name} placeholder={placeholder} className={searchField} />
    </label>
  );
}
const searchField =
  "min-h-11 w-full rounded-xl border border-[#d9c3bb] bg-white px-3 text-sm text-[#25191a] outline-none transition focus:border-[#b33a36] focus:ring-2 focus:ring-[#b33a36]/15 disabled:bg-[#eee7e3] disabled:text-stone-400";
