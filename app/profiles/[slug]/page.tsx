import type { DirectoryProfileImage } from "@/lib/directory";
import type { Metadata } from "next";
import {
  BadgeCheck,
  ChevronDown,
  Languages,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldAlert,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { demoProfiles } from "@/data/india";
import { getDirectoryProfile } from "@/lib/directory";

type ProfilePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return demoProfiles.map((profile) => ({ slug: profile.slug }));
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getDirectoryProfile(slug);
  if (!profile) return {};
  const title = `${profile.name}, ${profile.age} in ${profile.city}`;
  return {
    title,
    description: profile.shortBio,
    alternates: { canonical: `/profiles/${profile.slug}` },
    openGraph: { title, description: profile.shortBio, images: [{ url: profile.image }] },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const profile = await getDirectoryProfile(slug);
  if (!profile) notFound();
  const whatsappNumber = profile.contactWhatsapp?.replace(/\D/g, "");
  const telegramUrl = profile.contactTelegram
    ? profile.contactTelegram.startsWith("http")
      ? profile.contactTelegram
      : `https://t.me/${profile.contactTelegram.replace(/^@/, "")}`
    : undefined;

  return (
    <div className="profile-page-shell py-4 sm:py-12 lg:py-20">
      <div className="site-container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Profiles", href: "/profiles" },
            { label: profile.state, href: `/india/${profile.stateSlug}` },
            { label: profile.city, href: `/india/${profile.stateSlug}/${profile.citySlug}` },
            { label: profile.name },
          ]}
        />
        <article className="grid overflow-hidden rounded-[22px] border border-white/12 bg-surface shadow-2xl shadow-black/30 sm:rounded-[28px] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-2 bg-surface-2 p-2 sm:grid-cols-2">
            {profile.images.map(
  (image: DirectoryProfileImage, index: number) => (
              <div
                key={image.url}
                className={`relative overflow-hidden rounded-2xl bg-black ${index === 0 ? "min-h-[390px] sm:col-span-2 sm:min-h-[520px]" : "min-h-56 sm:min-h-64"}`}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  sizes={
                    index === 0
                      ? "(max-width: 1024px) 100vw, 48vw"
                      : "(max-width: 640px) 100vw, 24vw"
                  }
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <div className="profile-content-panel p-4 sm:p-8 lg:p-10 xl:p-12">
            <div className="inline-flex rounded-full border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand">
              {profile.isDemo ? "Fictional demo profile" : "18+ published listing"}
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.055em] sm:mt-6 sm:text-5xl">
              {profile.adTitle || `${profile.name}, ${profile.age}`}
            </h1>
            {profile.adTitle ? (
              <p className="mt-2 text-lg font-semibold">
                {profile.name}, {profile.age}
              </p>
            ) : null}
            <p className="mt-3 text-base font-bold text-brand sm:text-lg">
              {profile.category} · {profile.city}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-3 text-xs text-muted sm:mt-7 sm:gap-5 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="text-success" size={18} /> Adult record reviewed
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={18} /> {profile.city}, {profile.state}
              </span>
              {profile.languages.length ? (
                <span className="inline-flex items-center gap-2">
                  <Languages size={18} /> {profile.languages.join(", ")}
                </span>
              ) : null}
            </div>
            <p className="mt-5 whitespace-pre-line text-base leading-7 text-muted sm:mt-8 sm:text-lg sm:leading-8">
              {profile.fullBio}
            </p>
            {profile.services.length ? (
              <div className="mt-5 flex flex-wrap gap-2 sm:mt-8">
                {profile.services.map((service: string) => (
                  <span
                    key={service}
                    className="rounded-full border border-white/12 bg-surface-2 px-3 py-1.5 text-sm text-muted"
                  >
                    {service}
                  </span>
                ))}
              </div>
            ) : null}
            <details className="group profile-details-card mt-6 overflow-hidden rounded-2xl border border-white/12 sm:mt-10">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 [&::-webkit-details-marker]:hidden sm:min-h-16 sm:px-6">
                <span>
                  <span className="block font-display text-sm font-bold sm:text-base">
                    View complete details
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted sm:text-xs">
                    Availability, appearance and service preferences
                  </span>
                </span>
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-brand/30 bg-brand/10 text-brand">
                  <ChevronDown
                    size={18}
                    className="transition-transform duration-200 group-open:rotate-180"
                  />
                </span>
              </summary>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-white/10 bg-black/15 p-4 sm:gap-x-8 sm:gap-y-6 sm:p-6">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted sm:text-xs">
                    Availability
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold sm:mt-2 sm:text-base">
                    {profile.availability ?? "Contact advertiser"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted sm:text-xs">
                    Gallery
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold sm:mt-2 sm:text-base">
                    {profile.images.length} authorized image(s)
                  </dd>
                </div>
                {[
                  ["Gender", profile.gender],
                  ["Nationality", profile.nationality],
                  ["Ethnicity", profile.ethnicity],
                  ["Hair", profile.hairColor],
                  ["Eyes", profile.eyeColor],
                  ["Body type", profile.bodyType],
                  ["Bust", profile.bust],
                  ["Height", profile.heightCm ? `${profile.heightCm} cm` : undefined],
                  ["Weight", profile.weightKg ? `${profile.weightKg} kg` : undefined],
                  ["Attention to", profile.attentionTo],
                  ["Place of service", profile.placeOfService],
                ]
                  .filter((item) => item[1])
                  .map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted sm:text-xs">
                        {label}
                      </dt>
                      <dd className="mt-1.5 text-sm font-semibold sm:mt-2 sm:text-base">
                        {value}
                      </dd>
                    </div>
                  ))}
              </dl>
            </details>
            {profile.availabilitySlots?.length ? (
              <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
                {profile.availabilitySlots.map((slot) => (
                  <span
                    key={slot}
                    className="rounded-full border border-brand/35 bg-brand/10 px-3 py-1.5 text-sm"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-6 grid gap-3 sm:mt-9 sm:grid-cols-2">
              {profile.contactPhone && !profile.isDemo ? (
                <a
                  href={`tel:${profile.contactPhone}`}
                  className="brand-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold"
                >
                  <Phone size={19} /> Call
                </a>
              ) : null}
              {whatsappNumber && !profile.isDemo ? (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 font-bold"
                >
                  <MessageCircle size={19} /> WhatsApp
                </a>
              ) : null}
              {telegramUrl && !profile.isDemo ? (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-4 font-bold"
                >
                  <Send size={19} /> Telegram
                </a>
              ) : null}
              {profile.contactEmail && !profile.isDemo ? (
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-4 font-bold"
                >
                  <Mail size={19} /> Email
                </a>
              ) : null}
              {profile.isDemo ? (
                <Link
                  href="/contact"
                  className="brand-gradient inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 font-bold"
                >
                  <MessageCircle size={19} /> Send an enquiry
                </Link>
              ) : null}
              <Link
                href="/report-content"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-4 font-bold text-muted hover:text-paper"
              >
                <ShieldAlert size={19} /> Report content
              </Link>
            </div>
            <p className="mt-6 text-xs leading-5 text-muted">
              Ourly Bookings is an advertising directory and does not participate in private
              arrangements. Adults only; follow local law and obtain clear consent.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
