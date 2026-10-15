import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Phone, MessageCircle, MapPin, ShieldCheck, Flame } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCity, getCityProfiles, getState, indiaStates } from "@/data/india";
import { getDirectoryLocation, getDirectoryProfiles } from "@/lib/directory";

type CityPageProps = {
  params: Promise<{ stateSlug: string; citySlug: string }>;
};

export function generateStaticParams() {
  return indiaStates.flatMap((state) =>
    state.cities.map((city) => ({
      stateSlug: state.slug,
      citySlug: city.slug,
    }))
  );
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { stateSlug, citySlug } = await params;
  const apiLocation = await getDirectoryLocation(stateSlug, citySlug);
  const fallbackCity = getCity(stateSlug, citySlug);
  const city = apiLocation?.city ?? fallbackCity;
  const state = apiLocation?.state ?? getState(stateSlug);

  if (!city || !state) return {};

  const currentYear = new Date().getFullYear();
  const title = `${city.name} Call girls (${state.name}) - Top Escorts & Independent Classifieds ${currentYear}`;
  const description = `Find verified call girls in ${city.name}, independent escorts, and genuine companion services. Cash payment on meeting, no advance fraud, 100% genuine photos and direct WhatsApp numbers.`;

  return {
    title,
    description,
    keywords: [
      `call girls in ${city.name}`,
      `${city.name} call girls`,
      `${city.name} escort service`,
      `independent escorts in ${city.name}`,
      `call girl contact number ${city.name}`,
      `female escorts ${city.name}`,
    ],
    alternates: { canonical: `/india/${stateSlug}/${citySlug}` },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { stateSlug, citySlug } = await params;
  const [apiLocation, apiProfiles] = await Promise.all([
    getDirectoryLocation(stateSlug, citySlug),
    getDirectoryProfiles({ state: stateSlug, city: citySlug }),
  ]);
  const fallbackCity = getCity(stateSlug, citySlug);
  const fallbackState = getState(stateSlug);
  const city = apiLocation?.city ?? fallbackCity;
  const state = apiLocation?.state ?? fallbackState;

  if (!city || !state) notFound();

  const fallbackProfiles = getCityProfiles(stateSlug, citySlug);
  const profiles = apiProfiles.length > 0 ? apiProfiles : fallbackProfiles;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${city.name} Call Girls & Escorts (${state.name})`,
    description: `Directory of verified call girls and independent adult escorts in ${city.name}, ${state.name}.`,
    url: `https://ourlybookings.com/india/${state.slug}/${city.slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://ourlybookings.com" },
        { "@type": "ListItem", position: 2, name: "India", item: "https://ourlybookings.com/india" },
        { "@type": "ListItem", position: 3, name: `${state.name} Call Girls`, item: `https://ourlybookings.com/india/${state.slug}` },
        { "@type": "ListItem", position: 4, name: `${city.name} Call Girls`, item: `https://ourlybookings.com/india/${state.slug}/${city.slug}` },
      ],
    },
  };

  const categoriesSilo = [
    { title: `Call Girls ${city.name}`, icon: "👄", slug: "call-girls" },
    { title: `Massage ${city.name}`, icon: "💆", slug: "massage" },
    { title: `Male Escorts ${city.name}`, icon: "🧔", slug: "male-escorts" },
    { title: `Transsexual ${city.name}`, icon: "👠", slug: "transsexual" },
    { title: `Adult Meetings ${city.name}`, icon: "🍸", slug: "adult-meetings" },
  ];

  return (
    <div className="min-h-screen bg-[#0d0f15] text-[#e0e0e0] pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="site-container pt-6">
        {/* Breadcrumb Hierarchy (Oklute Style) */}
        <Breadcrumbs
          items={[
            { label: "India", href: "/india" },
            { label: `${state.name} Call Girls`, href: `/india/${state.slug}` },
            { label: `${city.name} Call Girls` },
          ]}
        />

        {/* Main H1 Exact Match */}
        <div className="mt-4 border-b border-white/10 pb-4">
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {city.name} Call girls ({state.name})
          </h1>
          <p className="mt-1 text-xs text-muted">
            Independent adult advertisements and verified direct-contact companion profiles in {city.name}.
          </p>
        </div>

        {/* Search Bar / Quick Locality Indicator */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs sm:text-sm">
          <span className="flex items-center gap-2 text-white/90">
            <MapPin size={16} className="text-brand" />
            Showing ads in: <strong className="text-white">{state.name} - {city.name}</strong>
          </span>
          <Link
            href="/india"
            className="rounded-lg border border-white/15 px-3 py-1 text-xs text-muted transition hover:border-brand hover:text-white"
          >
            Change City
          </Link>
        </div>

        {/* Oklute-Style Dense Classified Listings List */}
        <div className="mt-6 space-y-4">
          {profiles.length > 0 ? (
            profiles.map((profile) => (
              <div
                key={profile.id}
                className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-brand/60 hover:bg-white/[0.04]"
              >
                {/* VIP / NEW Badge */}
                <span className="absolute left-3 top-3 z-10 rounded-md bg-brand px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  VIP Verified
                </span>

                {/* Left: Compact Image Container */}
                <div className="relative aspect-[4/3] w-full sm:w-64 sm:shrink-0 bg-black">
                  <Image
                    src={profile.images?.[0]?.url || profile.avatarUrl || "/images/hero-lounge.png"}
                    alt={profile.title || `${profile.name} - Call girl in ${city.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 260px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-2 left-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-white">
                    📷 {profile.images?.length || 1}
                  </span>
                </div>

                {/* Right: Classified Content Details */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                  <div>
                    <Link
                      href={`/profiles/${profile.slug || profile.id}`}
                      className="font-display text-base font-bold uppercase tracking-tight text-[#ff3366] transition group-hover:underline sm:text-lg"
                    >
                      {profile.title || `FULL CASH PAYMENT NO ADVANCE CALL GIRL SERVICE ${city.name.toUpperCase()}`}
                    </Link>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                      {profile.about ||
                        `VIP door-step outcall and incall service in ${city.name}. Genuine independent companion with no advance payment fraud. Available 24/7 across Civil Lines, Katra, and all nearby areas.`}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/70">
                      <span>👤 {profile.age || 24} Years</span>
                      <span>📍 {city.name} / {profile.locality || "Civil Lines"}</span>
                      <span>🇮🇳 Indian</span>
                    </div>
                  </div>

                  {/* Direct WhatsApp / Call Buttons */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck size={14} /> Zero Advance Payment
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${(profile.whatsappNumber || profile.phone || "919999999999").replace(/[^0-9]/g, "")}?text=Hi%20I%20saw%20your%20listing%20for%20${city.name}%20on%20OurlyBookings`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 text-xs font-bold text-white transition hover:bg-emerald-500"
                      >
                        <MessageCircle size={15} /> WhatsApp
                      </a>
                      <a
                        href={`tel:${profile.phone || "9999999999"}`}
                        className="flex h-9 items-center gap-1.5 rounded-full bg-brand px-3.5 text-xs font-bold text-white transition hover:brightness-110"
                      >
                        <Phone size={15} /> Call
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-muted">
              No approved ads in {city.name} right now. Click "Post Your Ad" to publish the first listing!
            </div>
          )}
        </div>

        {/* Category Silos Matrix (Exact Oklute Replica) */}
        <section className="mt-14">
          <h2 className="font-display text-lg font-bold text-white">
            {city.name} Classifieds Categories
          </h2>
          <div className="mt-4 flex flex-col gap-2.5">
            {categoriesSilo.map((cat) => (
              <Link
                key={cat.slug}
                href={`/india/${state.slug}/${city.slug}?category=${cat.slug}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm font-bold text-white transition hover:border-brand hover:bg-white/[0.05] hover:text-brand"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  {cat.title}
                </span>
                <span className="text-muted group-hover:text-brand">&rarr;</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Rich SEO Content (Footnote Narrative) */}
        <section className="mt-14 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-xs leading-relaxed text-muted sm:text-sm">
          <h2 className="font-display text-base font-bold text-white sm:text-lg">
            Find the Best Call Girls and Escorts in {city.name}
          </h2>
          <p className="mt-3">
            Looking for independent call girls or verified escorts in {city.name}? Ourly Bookings connects you directly with genuine advertisers without agency intervention. Browse photos, verified contact phone numbers, and direct WhatsApp links across all major localities including Civil Lines, Katra, Naini, Jhunsi, and George Town.
          </p>
          <p className="mt-3">
            <strong>Safety Advisory:</strong> Always follow safe meeting practices. Never send advance deposits, travel allowances, or registration fees prior to meeting in person. All advertisers are responsible for their own advertisements.
          </p>
        </section>
      </div>
    </div>
  );
}
