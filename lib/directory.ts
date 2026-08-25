import { demoProfiles, getProfile, indiaStates } from "@/data/india";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type DirectoryProfile = {
  id: string;
  name: string;
  slug: string;
  age: number;
  adTitle?: string;
  category: string;
  city: string;
  citySlug: string;
  state: string;
  stateSlug: string;
  languages: readonly string[];
  nationality?: string;
  gender?: string;
  ethnicity?: string;
  hairColor?: string;
  eyeColor?: string;
  weightKg?: number;
  heightCm?: number;
  bodyType?: string;
  bust?: string;
  attentionTo?: string;
  placeOfService?: string;
  availabilitySlots?: readonly string[];
  shortBio: string;
  fullBio: string;
  availability?: string;
  pricingNotes?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactTelegram?: string;
  contactEmail?: string;
  image: string;
  imageAlt: string;
  images: readonly { url: string; alt: string; title?: string }[];
  services: readonly string[];
  isDemo: boolean;
  publishedAt?: string;
  updatedAt?: string;
};

type ApiProfile = {
  id: string;
  displayName: string;
  slug: string;
  age: number;
  adTitle?: string;
  nationality?: string;
  gender?: string;
  ethnicity?: string;
  hairColor?: string;
  eyeColor?: string;
  weightKg?: number;
  heightCm?: number;
  bodyType?: string;
  bust?: string;
  attentionTo?: string;
  placeOfService?: string;
  availabilitySlots?: string[];
  languages: string[];
  shortIntro: string;
  fullBio?: string;
  availability?: string;
  pricingNotes?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactTelegram?: string;
  contactEmail?: string;
  publishedAt?: string;
  updatedAt?: string;
  categories: { category: { name: string; slug: string } }[];
  services: { service: { name: string; slug: string } }[];
  locations: {
    city: {
      name: string;
      slug: string;
      state: {
        name: string;
        slug: string;
        country?: { name: string; slug: string; code: string };
      };
    };
  }[];
  media: {
    role: string;
    media: { secureUrl: string; altText: string; title?: string; resourceType: string };
  }[];
};

export type DirectoryState = {
  id?: string;
  name: string;
  slug: string;
  type?: string;
  summary?: string;
  description?: string;
  cities: readonly { id?: string; name: string; slug: string; description?: string }[];
};

export type DirectoryOptions = {
  countries: {
    id: string;
    name: string;
    code: string;
    slug: string;
    states: DirectoryState[];
  }[];
  categories: { id: string; name: string; slug: string; description?: string; imageUrl?: string }[];
  services: { id: string; name: string; slug: string }[];
};

async function publicApi<T>(path: string, fresh = false): Promise<T | null> {
  try {
    const response = await fetch(
      `${apiUrl}${path}`,
      fresh ? { cache: "no-store" } : { next: { revalidate: 60 } },
    );
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function fromApi(profile: ApiProfile): DirectoryProfile | null {
  const location = profile.locations[0]?.city;
  const images = profile.media
    .filter((item) => item.media.resourceType === "IMAGE")
    .slice(0, 5)
    .map((item) => ({
      url: item.media.secureUrl,
      alt: item.media.altText,
      title: item.media.title,
    }));
  if (!location || !images[0]) return null;
  return {
    id: profile.id,
    name: profile.displayName,
    slug: profile.slug,
    age: profile.age,
    adTitle: profile.adTitle,
    category: profile.categories[0]?.category.name ?? "Independent",
    city: location.name,
    citySlug: location.slug,
    state: location.state.name,
    stateSlug: location.state.slug,
    languages: profile.languages,
    nationality: profile.nationality,
    gender: profile.gender,
    ethnicity: profile.ethnicity,
    hairColor: profile.hairColor,
    eyeColor: profile.eyeColor,
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    bodyType: profile.bodyType,
    bust: profile.bust,
    attentionTo: profile.attentionTo,
    placeOfService: profile.placeOfService,
    availabilitySlots: profile.availabilitySlots,
    shortBio: profile.shortIntro,
    fullBio: profile.fullBio ?? profile.shortIntro,
    availability: profile.availability,
    pricingNotes: profile.pricingNotes,
    contactPhone: profile.contactPhone,
    contactWhatsapp: profile.contactWhatsapp,
    contactTelegram: profile.contactTelegram,
    contactEmail: profile.contactEmail,
    image: images[0].url,
    imageAlt: images[0].alt,
    images,
    services: profile.services.map((item) => item.service.name),
    isDemo: false,
    publishedAt: profile.publishedAt,
    updatedAt: profile.updatedAt,
  };
}

function fromDemo(profile: (typeof demoProfiles)[number]): DirectoryProfile {
  return {
    id: profile.id,
    name: profile.name,
    slug: profile.slug,
    age: profile.age,
    category: profile.category,
    city: profile.city,
    citySlug: profile.citySlug,
    state: profile.state,
    stateSlug: profile.stateSlug,
    languages: profile.languages,
    shortBio: profile.shortBio,
    fullBio: profile.fullBio,
    availability: profile.availability,
    image: profile.image,
    imageAlt: profile.imageAlt,
    images: [{ url: profile.image, alt: profile.imageAlt }],
    services: [],
    isDemo: true,
  };
}

export async function getDirectoryProfiles(filters?: {
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
}) {
  const search = new URLSearchParams();
  Object.entries(filters ?? {}).forEach(([key, value]) => value && search.set(key, value));
  // Moderated listings must become visible as soon as an administrator approves
  // them. Keeping this request out of Next's data cache also makes removals and
  // rejection changes take effect immediately on every directory page.
  const profiles = await publicApi<ApiProfile[]>(`/public/profiles?${search.toString()}`, true);
  if (profiles)
    return profiles.map(fromApi).filter((profile): profile is DirectoryProfile => Boolean(profile));
  return demoProfiles
    .filter(
      (profile) =>
        (!filters?.state || profile.stateSlug === filters.state) &&
        (!filters?.city || profile.citySlug === filters.city) &&
        (!filters?.category || profile.category.toLowerCase() === filters.category.toLowerCase()),
    )
    .map(fromDemo);
}

export async function getDirectoryOptions() {
  const options = await publicApi<DirectoryOptions>("/public/ad-options", true);
  if (!options) return null;

  return {
    ...options,
    countries: options.countries.map((country) => {
      if (country.code !== "IN" && country.slug !== "india") return country;

      const apiStates = new Map(country.states.map((state) => [state.slug, state]));
      const mergedStates: DirectoryState[] = indiaStates.map((indiaState) => {
        const apiState = apiStates.get(indiaState.slug);
        const apiCities = new Map(
          (apiState?.cities ?? []).map((directoryCity) => [directoryCity.slug, directoryCity]),
        );
        const mergedCities = indiaState.cities.map((indiaCity) => ({
          ...indiaCity,
          ...apiCities.get(indiaCity.slug),
        }));

        for (const apiCity of apiState?.cities ?? []) {
          if (!mergedCities.some((directoryCity) => directoryCity.slug === apiCity.slug)) {
            mergedCities.push(apiCity);
          }
        }

        apiStates.delete(indiaState.slug);
        return {
          name: indiaState.name,
          slug: indiaState.slug,
          type: indiaState.type,
          summary: indiaState.summary,
          ...apiState,
          cities: mergedCities,
        };
      });

      return {
        ...country,
        states: [...mergedStates, ...apiStates.values()],
      };
    }),
  };
}

export type CategoryLocations = {
  category: { id: string; name: string; slug: string; description: string; imageUrl?: string };
  cities: {
    name: string;
    slug: string;
    state: { name: string; slug: string; country: { name: string; slug: string } };
  }[];
};

export async function getCategoryLocations(slug: string) {
  return publicApi<CategoryLocations>(
    `/public/categories/${encodeURIComponent(slug)}/locations`,
    true,
  );
}

export async function getDirectoryProfile(slug: string) {
  const profile = await publicApi<ApiProfile>(`/public/profiles/${encodeURIComponent(slug)}`, true);
  if (profile) return fromApi(profile);
  const demo = getProfile(slug);
  return demo ? fromDemo(demo) : null;
}

export async function getDirectoryLocations() {
  return publicApi<DirectoryState[]>("/public/locations");
}

export async function getDirectoryLocation(stateSlug: string, citySlug?: string) {
  const path = citySlug
    ? `/public/locations/${encodeURIComponent(stateSlug)}/${encodeURIComponent(citySlug)}`
    : `/public/locations/${encodeURIComponent(stateSlug)}`;
  return publicApi<DirectoryState>(path);
}
