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
import { ProfileCard } from "@/components/profile-card";
import { SectionHeading } from "@/components/section-heading";
import { indiaStates } from "@/data/india";
import { getDirectoryOptions, getDirectoryProfiles } from "@/lib/directory";
import { siteConfig } from "@/lib/site";

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
  const [directoryProfiles, directoryOptions] = await Promise.all([
    getDirectoryProfiles(),
    getDirectoryOptions(),
  ]);
  const featuredProfiles = directoryProfiles.slice(0, 3);
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
      <section className="relative isolate min-h-[760px] overflow-hidden border-b border-white/10">
        <Image
          src="/images/hero-lounge.png?v=20260812"
          alt="Premium Ourly Bookings homepage banner"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[68%_center]"
        />
        <div className="site-container flex min-h-[760px] items-center py-16">
          <div className="w-full max-w-3xl">
            <h1 className="text-balance max-w-2xl font-display text-5xl font-bold leading-[1.02] tracking-[-0.06em] text-paper sm:text-6xl lg:text-7xl">
              Discover verified independent profiles worldwide
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Privacy-first discovery for consenting adults, with city-based browsing, consent
              controls and direct advertiser contact.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/profiles"
                className="brand-gradient rounded-xl px-7 py-4 text-center font-bold text-white shadow-xl shadow-brand/20"
              >
                Browse Profiles
              </Link>
              <Link
                href="/india"
                className="rounded-xl border border-brand/60 bg-black/35 px-7 py-4 text-center font-bold text-paper backdrop-blur hover:bg-brand/10"
              >
                Explore Locations
              </Link>
            </div>
            <div className="mt-10 max-w-3xl">
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
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              title="Featured independent profiles"
              description="Published listings use authorized source images and pass the profile publication workflow."
            />
            <Link href="/profiles" className="shrink-0 font-bold text-brand">
              View all profiles →
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
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
          <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {stateRail.map((state) => (
              <div key={state.slug} className="border-t border-white/15 pt-5">
                <Link
                  href={`/india/${state.slug}`}
                  className="font-display text-2xl font-bold tracking-[-0.04em] hover:text-brand"
                >
                  {state.name}
                </Link>
                <ul className="mt-5 space-y-3 text-sm text-muted">
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
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,7,12,0.96),rgba(10,12,18,0.78)_52%,rgba(5,7,12,0.92)),linear-gradient(180deg,rgba(5,7,12,0.50),rgba(5,7,12,0.94))]" />
        <div className="site-container relative">
          <SectionHeading
            title="Explore popular services"
            description="Service pages use careful, non-misleading language and link only to independently managed profiles."
          />
          <div className="mt-12 grid overflow-hidden rounded-[24px] border border-white/15 bg-black/35 shadow-2xl shadow-black/30 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-5">
            {services.map(({ title, icon: Icon }) => (
              <Link
                key={title}
                href="/services"
                className="group flex min-h-44 flex-col justify-between border-b border-white/12 p-6 transition hover:bg-white/10 sm:border-r lg:border-b-0"
              >
                <Icon className="text-brand transition group-hover:scale-110" size={30} />
                <span className="font-display text-lg font-bold">{title}</span>
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
            {[
              [
                "Meeting safely for the first time",
                "A practical consent, privacy and communication checklist.",
              ],
              [
                "Protecting your privacy online",
                "Simple steps for safer messaging and personal-data control.",
              ],
              [
                "Browsing profiles by Indian city",
                "Use state and city pages without exposing sensitive information.",
              ],
            ].map(([title, copy]) => (
              <article key={title} className="surface-border rounded-[20px] bg-surface p-6">
                <h3 className="font-display text-xl font-bold">{title}</h3>
                <p className="mt-4 leading-7 text-muted">{copy}</p>
                <Link href="/blog" className="mt-6 inline-block font-bold text-brand">
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
