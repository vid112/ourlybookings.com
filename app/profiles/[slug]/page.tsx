import type { Metadata } from "next";
import { BadgeCheck, Languages, Mail, MapPin, MessageCircle, Phone, Send, ShieldAlert } from "lucide-react";
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
    <div className="section-space">
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
        <article className="grid overflow-hidden rounded-[28px] border border-white/12 bg-surface lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-2 bg-surface-2 p-2 sm:grid-cols-2">
            {profile.images.slice(0, 5).map((image, index) => (
              <div
                key={image.url}
                className={`relative overflow-hidden rounded-2xl bg-black ${index === 0 ? "min-h-[520px] sm:col-span-2" : "min-h-64"}`}
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
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="inline-flex rounded-full border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand">
              {profile.isDemo ? "Fictional demo profile" : "18+ published listing"}
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold tracking-[-0.055em]">
              {profile.name}, {profile.age}
            </h1>
            <p className="mt-3 text-lg font-bold text-brand">
              {profile.category} · {profile.city}
            </p>
            <div className="mt-7 flex flex-wrap gap-5 text-sm text-muted">
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
            <p className="mt-8 whitespace-pre-line text-lg leading-8 text-muted">
              {profile.fullBio}
            </p>
            {profile.services.length ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {profile.services.map((service) => (
                  <span
                    key={service}
                    className="rounded-full border border-white/12 bg-surface-2 px-3 py-1.5 text-sm text-muted"
                  >
                    {service}
                  </span>
                ))}
              </div>
            ) : null}
            <dl className="mt-10 grid gap-5 border-y border-white/12 py-7 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.15em] text-muted">
                  Availability
                </dt>
                <dd className="mt-2 font-semibold">
                  {profile.availability ?? "Contact advertiser"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.15em] text-muted">
                  Gallery
                </dt>
                <dd className="mt-2 font-semibold">
                  {profile.images.length} authorized source image(s)
                </dd>
              </div>
            </dl>
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
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
                <a href={telegramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-4 font-bold">
                  <Send size={19} /> Telegram
                </a>
              ) : null}
              {profile.contactEmail && !profile.isDemo ? (
                <a href={`mailto:${profile.contactEmail}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-4 font-bold">
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
