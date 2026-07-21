import type { Metadata } from "next";
import { BadgeCheck, Languages, MapPin, MessageCircle, ShieldAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { demoProfiles, getProfile } from "@/data/india";

type ProfilePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return demoProfiles.map((profile) => ({ slug: profile.slug }));
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = getProfile(slug);
  if (!profile) return {};
  const title = `${profile.name}, ${profile.age} — Demo Profile in ${profile.city}`;
  return {
    title,
    description: profile.shortBio,
    alternates: { canonical: `/profiles/${profile.slug}` },
    openGraph: { title, description: profile.shortBio, images: [{ url: profile.image }] },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const profile = getProfile(slug);
  if (!profile) notFound();

  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Profiles", href: "/profiles" },
            { label: profile.state, href: `/india/${profile.stateSlug}` },
            { label: profile.name },
          ]}
        />
        <article className="grid overflow-hidden rounded-[28px] border border-white/12 bg-surface lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative min-h-[520px] bg-surface-2 lg:min-h-[720px]">
            <Image
              src={profile.image}
              alt={profile.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="p-6 sm:p-10 lg:p-14">
            <div className="inline-flex rounded-full border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand">
              Fictional demo profile
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold tracking-[-0.055em]">
              {profile.name}, {profile.age}
            </h1>
            <p className="mt-3 text-lg font-bold text-brand">
              {profile.category} · {profile.city}
            </p>
            <div className="mt-7 flex flex-wrap gap-5 text-sm text-muted">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="text-success" size={18} /> Adult verification field
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={18} /> {profile.city}, {profile.state}
              </span>
              <span className="inline-flex items-center gap-2">
                <Languages size={18} /> {profile.languages.join(", ")}
              </span>
            </div>
            <p className="mt-8 text-lg leading-8 text-muted">{profile.fullBio}</p>
            <dl className="mt-10 grid gap-5 border-y border-white/12 py-7 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.15em] text-muted">
                  Availability
                </dt>
                <dd className="mt-2 font-semibold">{profile.availability}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.15em] text-muted">
                  Publication state
                </dt>
                <dd className="mt-2 font-semibold">Demo only — no live contact</dd>
              </div>
            </dl>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="brand-gradient inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 font-bold"
              >
                <MessageCircle size={19} /> Send an enquiry
              </Link>
              <Link
                href="/report-content"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-7 py-4 font-bold text-muted hover:text-paper"
              >
                <ShieldAlert size={19} /> Report content
              </Link>
            </div>
            <p className="mt-6 text-xs leading-5 text-muted">
              No service, identity, availability or verification claim on this demo record
              represents a real person. Never upload real media without written permission.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
