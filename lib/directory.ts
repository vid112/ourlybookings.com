import { demoProfiles, getProfile } from "@/data/india";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type DirectoryProfile = {
  id: string;
  name: string;
  slug: string;
  age: number;
  category: string;
  city: string;
  citySlug: string;
  state: string;
  stateSlug: string;
  languages: readonly string[];
  nationality?: string;
  shortBio: string;
  fullBio: string;
  availability?: string;
  pricingNotes?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  image: string;
  imageAlt: string;
  images: readonly { url: string; alt: string; title?: string }[];
  services: readonly string[];
  isDemo: boolean;
};

type ApiProfile = {
  id: string;
  displayName: string;
  slug: string;
  age: number;
  nationality?: string;
  languages: string[];
  shortIntro: string;
  fullBio?: string;
  availability?: string;
  pricingNotes?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  categories: { category: { name: string; slug: string } }[];
  services: { service: { name: string; slug: string } }[];
  locations: { city: { name: string; slug: string; state: { name: string; slug: string } } }[];
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
    category: profile.categories[0]?.category.name ?? "Independent",
    city: location.name,
    citySlug: location.slug,
    state: location.state.name,
    stateSlug: location.state.slug,
    languages: profile.languages,
    nationality: profile.nationality,
    shortBio: profile.shortIntro,
    fullBio: profile.fullBio ?? profile.shortIntro,
    availability: profile.availability,
    pricingNotes: profile.pricingNotes,
    contactPhone: profile.contactPhone,
    contactWhatsapp: profile.contactWhatsapp,
    image: images[0].url,
    imageAlt: images[0].alt,
    images,
    services: profile.services.map((item) => item.service.name),
    isDemo: false,
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
  state?: string;
  city?: string;
  category?: string;
}) {
  const search = new URLSearchParams();
  if (filters?.state) search.set("state", filters.state);
  if (filters?.city) search.set("city", filters.city);
  if (filters?.category) search.set("category", filters.category);
  const profiles = await publicApi<ApiProfile[]>(`/public/profiles?${search.toString()}`);
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

export async function getDirectoryProfile(slug: string) {
  const profile = await publicApi<ApiProfile>(
    `/public/profiles/${encodeURIComponent(slug)}`,
    true,
  );
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
