import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarHeart,
  CircleUserRound,
  EyeOff,
  Flag,
  HeartHandshake,
  MapPin,
  MessageCircleMore,
  Plane,
  ShieldCheck,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HeroSearch } from "@/components/hero-search";
import { ProfileListItem } from "@/components/profile-list-item";
import { SectionHeading } from "@/components/section-heading";
import { indiaStates } from "@/data/india";
import { getDirectoryOptions, getDirectoryProfiles } from "@/lib/directory";
import { siteConfig } from "@/lib/site";
import { getBlogPosts } from "@/lib/blog";

const featuredStates = ["maharashtra", "karnataka", "delhi", "tamil-nadu", "telangana", "gujarat"];
const stateRail = indiaStates.filter((state) => featuredStates.includes(state.slug));

const services = [
  { title: "Companionship", icon: HeartHandshake },
  { title: "Dinner dates", icon: CalendarHeart },
  { title: "Travel companion", icon: Plane },
  { title: "Event companion", icon: BriefcaseBusiness },
  { title: "Personal attention", icon: MessageCircleMore },
] as const;

const trustItems = [
  {
    icon: BadgeCheck,
    title: "Adult verification",
    copy: "Private record required before publishing",
  },
  { icon: EyeOff, title: "Privacy first", copy: "Sensitive verification files never go public" },
  {
    icon: CircleUserRound,
    title: "Direct contact",
    copy: "Advertisers manage their own communication",
  },
  { icon: Flag, title: "Report support", copy: "Takedown and urgent escalation workflow" },
] as const;

const faqs = [
  {
    question: "Is Ourly Bookings an agency?",
    answer:
      "No. Ourly Bookings is an advertising and discovery platform. Profiles are independently managed, and the platform is not a party to private arrangements.",
  },
  {
    question: "How are profiles published?",
    answer:
      "Production profiles require an adult-verification record, publication consent and media-rights confirmation before an administrator can publish them.",
  },
  {
    question: "How do I contact an advertiser?",
    answer:
      "Open a profile and use its configured direct-contact method. Always verify details, communicate respectfully and follow applicable law.",
  },
  {
    question: "What content is prohibited?",
    answer:
      "Minors, coercion, trafficking, stolen media, non-consensual content, misleading claims and unlawful services are prohibited and can be reported for urgent review.",
  },
] as const;

export default async function HomePage() {
  const [directoryProfiles, directoryOptions, blogPosts] = await Promise.all([
    getDirectoryProfiles(),
    getDirectoryOptions(),
    getBlogPosts(),
  ]);
  const featuredProfiles = directoryProfiles.slice(0, 10);
  const latestProfileUpdate = directoryProfiles.reduce<string | undefined>((latest, profile) => {
    if (!profile.updatedAt) return latest;
    return !latest || profile.updatedAt > latest ? profile.updatedAt : latest;
  }, undefined);
  const categoryCards = directoryOptions?.categories ?? [];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en-IN",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative isolate overflow-hidden border-b border-white/10 md:min-h-[760px]">
        <div className="relative aspect-[1783/882] w-full overflow-hidden bg-black md:hidden">
          <Image
            src="/images/hero-lounge.png?v=20260812"
            alt="Premium Ourly Bookings homepage banner"
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,4,8,0.84)_0%,rgba(3,4,8,0.58)_38%,rgba(3,4,8,0.04)_72%)]" />
          <div className="absolute inset-y-0 left-0 flex w-[61%] flex-col justify-center px-4 py-3 sm:px-7">
            <p className="mb-1.5 text-[7px] font-extrabold uppercase tracking-[0.18em] text-brand sm:text-[9px]">
              Verified • Private • Independent
            </p>
            <h1 className="text-balance font-display text-[17px] font-bold leading-[1.08] tracking-[-0.05em] text-white min-[420px]:text-xl sm:text-3xl">
              Discover verified profiles worldwide
            </h1>
            <p className="mt-1.5 max-w-56 text-[8px] leading-[1.45] text-white/75 min-[420px]:text-[9px] sm:mt-2 sm:text-xs">
              Privacy-first discovery for consenting adults.
            </p>
            <div className="mt-2.5 flex gap-1.5 sm:mt-4 sm:gap-2">
              <Link
                href="/profiles"
                className="brand-gradient rounded-md px-2.5 py-1.5 text-center text-[8px] font-extrabold text-white shadow-lg shadow-brand/20 min-[420px]:text-[9px] sm:rounded-lg sm:px-4 sm:py-2 sm:text-xs"
              >
                Browse Profiles
              </Link>
              <Link
                href="/india"
                className="rounded-md border border-white/35 bg-black/30 px-2.5 py-1.5 text-center text-[8px] font-extrabold text-white backdrop-blur-sm min-[420px]:text-[9px] sm:rounded-lg sm:px-4 sm:py-2 sm:text-xs"
              >
                Explore India
              </Link>
            </div>
          </div>
        </div>
        <Image
          src="/images/hero-lounge.png?v=20260812"
          alt="Premium Ourly Bookings homepage banner"
          fill
          priority
          sizes="100vw"
          className="-z-10 hidden object-cover object-[68%_center] md:block"
        />
        <div className="absolute inset-0 -z-[5] hidden bg-gradient-to-r from-black/85 via-black/55 to-black/20 md:block" />
        <div className="home-mobile-hero relative md:bg-transparent">
          <div className="home-mobile-orb home-mobile-orb-one md:hidden" aria-hidden="true" />
          <div className="home-mobile-orb home-mobile-orb-two md:hidden" aria-hidden="true" />
          <div className="site-container flex items-center py-5 sm:py-8 md:min-h-[760px] md:py-16">
            <div className="w-full max-w-3xl">
              <h1 className="hidden max-w-2xl text-balance font-display font-bold leading-[1.08] tracking-[-0.055em] text-paper md:block md:text-6xl lg:text-7xl">
                Discover verified independent profiles worldwide
              </h1>
              <p className="mt-6 hidden max-w-xl text-lg leading-8 text-muted md:block">
                Privacy-first discovery for consenting adults, with city-based browsing, consent
                controls and direct advertiser contact.
              </p>
              <div className="mt-8 hidden gap-3 md:flex md:flex-row">
                <Link
                  href="/profiles"
                  className="brand-gradient rounded-xl px-3 py-3.5 text-center text-sm font-bold text-white shadow-xl shadow-brand/20 transition hover:-translate-y-0.5 sm:px-7 sm:py-4 sm:text-base"
                >
                  Browse Profiles
                </Link>
                <Link
                  href="/india"
                  className="rounded-xl border border-brand/60 bg-black/35 px-3 py-3.5 text-center text-sm font-bold text-paper backdrop-blur transition hover:-translate-y-0.5 hover:bg-brand/10 sm:px-7 sm:py-4 sm:text-base"
                >
                  Explore Locations
                </Link>
              </div>
              <div className="max-w-3xl md:mt-10">
                <HeroSearch
                  countries={directoryOptions?.countries ?? []}
                  categories={directoryOptions?.categories ?? []}
                />
              </div>
              <p className="mt-5 flex max-w-xl items-start gap-2 text-xs leading-5 text-muted">
                <ShieldCheck className="mt-0.5 shrink-0 text-gold" size={16} />
                18+ only. Advertisers are independently responsible for content and lawful
                communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-surface">
        <div className="site-container grid gap-6 py-7 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex gap-4">
              <Icon className="mt-1 shrink-0 text-brand" size={22} />
              <div>
                <h2 className="font-display font-bold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="categories" className="section-space scroll-mt-24">
        <div className="site-container">
          <SectionHeading
            title="Find listings by category"
            description="Choose a service category, then browse every country and city where approved listings are available. Category images can be uploaded from the admin panel."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categoryCards.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group overflow-hidden rounded-[24px] border border-white/12 bg-surface transition hover:-translate-y-1 hover:border-brand/50"
              >
                <div
                  className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#b62455,#161d2d_65%)]"
                  style={
                    category.imageUrl
                      ? {
                          backgroundImage: `linear-gradient(to top, rgba(5,5,5,.35), rgba(5,5,5,.05)), url(${category.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  {!category.imageUrl ? (
                    <ImageIcon
                      size={54}
                      className="text-white/55"
                      aria-label="Category image pending upload"
                    />
                  ) : null}
                  <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold">
                    18+ listings
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-bold">{category.name}</h3>
                  <p className="mt-3 line-clamp-3 leading-7 text-muted">{category.description}</p>
                  <span className="mt-5 inline-flex font-bold text-brand">
                    Explore countries and cities →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <SectionHeading
              title="Latest independent posts"
              description="Browse the newest approved advertisements in a compact list. Open any post for complete details and contact options."
            />
            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              {latestProfileUpdate ? (
                <p className="text-xs text-muted">
                  Last updated:{" "}
                  {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                    new Date(latestProfileUpdate),
                  )}
                </p>
              ) : null}
              <Link href="/profiles" className="font-bold text-brand">
                View all posts →
              </Link>
            </div>
          </div>
          {featuredProfiles.length ? (
            <div className="mt-9 space-y-4 sm:mt-10 sm:space-y-5">
              {featuredProfiles.map((profile) => (
                <ProfileListItem key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <div className="mt-9 rounded-[20px] border border-dashed border-white/15 p-8 text-center text-muted">
              No approved posts are available yet.
            </div>
          )}
          {directoryProfiles.length > 10 ? (
            <div className="mt-8 text-center">
              <Link
                href="/profiles"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-brand/55 px-6 font-bold text-brand transition hover:bg-brand/10"
              >
                View all {directoryProfiles.length} posts →
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-y border-white/10 bg-surface/60 py-20">
        <div className="site-container">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              title="India location highlights"
              description="Browse popular Indian states and cities here, or use global search for every configured country and region."
            />
            <Link href="/india" className="font-bold text-brand">
              All India locations →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:mt-12 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-3">
            {stateRail.map((state) => (
              <div key={state.slug} className="border-t border-white/15 pt-5">
                <Link
                  href={`/india/${state.slug}`}
                  className="font-display text-lg font-bold tracking-[-0.04em] hover:text-brand sm:text-2xl"
                >
                  {state.name}
                </Link>
                <ul className="mt-4 space-y-2.5 text-xs text-muted sm:mt-5 sm:space-y-3 sm:text-sm">
                  {state.cities.slice(0, 5).map((stateCity) => (
                    <li key={stateCity.slug}>
                      <Link
                        href={`/india/${state.slug}/${stateCity.slug}`}
                        className="inline-flex items-center gap-2 hover:text-paper"
                      >
                        <MapPin size={14} className="text-brand" />
                        {stateCity.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space relative isolate overflow-hidden border-y border-white/10">
        <Image
          src="/images/Background Image.png"
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(220,50,103,0.24),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(201,165,92,0.12),transparent_30%),linear-gradient(90deg,rgba(5,7,12,0.96),rgba(10,12,18,0.78)_52%,rgba(5,7,12,0.94)),linear-gradient(180deg,rgba(5,7,12,0.50),rgba(5,7,12,0.94))]" />
        <div className="site-container relative">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-brand">
              Find your experience
            </p>
            <h2 className="text-balance font-display text-3xl font-bold tracking-[-0.05em] text-paper sm:text-4xl lg:text-5xl">
              Explore our <span className="service-heading-accent">services</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-lg">
              Browse carefully described services linked only to independently managed profiles.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {services.map(({ title, icon: Icon }) => (
              <Link
                key={title}
                href="/services"
                className="service-card group flex min-h-36 flex-col justify-between rounded-2xl border border-white/12 bg-black/35 p-4 backdrop-blur-sm last:col-span-2 sm:min-h-44 sm:p-6 sm:last:col-span-1"
              >
                <span className="service-icon grid size-11 place-items-center rounded-2xl border border-brand/25 bg-brand/10 text-brand sm:size-12">
                  <Icon className="transition group-hover:scale-110" size={25} />
                </span>
                <span className="flex items-end justify-between gap-2">
                  <span className="font-display text-sm font-bold leading-5 sm:text-lg">{title}</span>
                  <span className="text-brand transition group-hover:translate-x-1" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="site-container rounded-[28px] border border-gold/35 bg-[linear-gradient(105deg,#2a2417,#101624_65%)] p-7 sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr_auto]">
            <div className="grid size-20 place-items-center rounded-3xl border border-gold/35 bg-gold/10 text-gold">
              <ShieldCheck size={40} />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.04em]">
                Your safety and privacy matter
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted">
                Consent records, private verification data, content reporting, controlled
                unpublishing and audit logs are built into the platform architecture.
              </p>
            </div>
            <Link
              href="/safety"
              className="rounded-xl border border-gold/60 px-6 py-3.5 text-center font-bold text-gold hover:bg-gold/10"
            >
              Read Safety Guide
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-surface/55 py-20">
        <div className="site-container">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading
              title="Gallery preview"
              description="Every production asset keeps its own alt text, caption, focal point and Cloudinary metadata."
            />
            <Link href="/gallery" className="hidden font-bold text-brand sm:block">
              View gallery →
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              "/images/profile-mumbai.png",
              "/images/profile-bengaluru.png",
              "/images/hero-lounge.png",
            ].map((src, index) => (
              <Link
                key={src}
                href="/gallery"
                className="group relative aspect-[4/3] overflow-hidden rounded-[20px] border border-white/12"
              >
                <Image
                  src={src}
                  alt={`Original fictional adult demo gallery image ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            title="Frequently asked questions"
            description="Clear platform, consent and safety answers are visible to visitors and mirrored in eligible structured data."
          />
          <div className="divide-y divide-white/12 border-y border-white/12">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="cursor-pointer list-none pr-8 font-display text-lg font-bold marker:hidden">
                  {faq.question}
                  <span className="float-right text-brand group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-2xl leading-7 text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-28">
        <div className="site-container">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading title="Latest safety and city guides" />
            <Link href="/blog" className="font-bold text-brand">
              All guides →
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {blogPosts.slice(0, 3).map((post) => (
              <article key={post.id} className="surface-border rounded-[20px] bg-surface p-6">
                <h3 className="font-display text-xl font-bold">{post.title}</h3>
                <p className="mt-4 leading-7 text-muted">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="mt-6 inline-block font-bold text-brand">
                  Read guide →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// Featured profiles are moderation-driven data and must not leave a newly
// approved or removed listing hidden behind the full-route cache.
export const dynamic = "force-dynamic";
