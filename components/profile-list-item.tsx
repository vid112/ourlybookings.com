import { BadgeCheck, Languages, MapPin, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { DirectoryProfile } from "@/lib/directory";

function whatsappHref(value: string) {
  const phone = value.replace(/\D/g, "");
  return phone ? `https://wa.me/${phone}` : undefined;
}

export function ProfileListItem({ profile }: { profile: DirectoryProfile }) {
  const title = profile.adTitle?.trim() || `${profile.name}, ${profile.age}`;
  const serviceSummary = [profile.category, ...profile.services].filter(Boolean).slice(0, 5);
  const whatsapp = profile.contactWhatsapp ? whatsappHref(profile.contactWhatsapp) : undefined;

  return (
    <article className="group grid min-h-44 grid-cols-[112px_minmax(0,1fr)] overflow-hidden rounded-[20px] border border-white/12 bg-[linear-gradient(135deg,rgba(22,29,45,0.96),rgba(11,14,22,0.98))] shadow-[0_16px_42px_rgba(0,0,0,0.2)] transition hover:border-brand/45 sm:min-h-52 sm:grid-cols-[176px_minmax(0,1fr)] lg:grid-cols-[205px_minmax(0,1fr)]">
      <Link
        href={`/profiles/${profile.slug}`}
        className="relative min-h-full overflow-hidden bg-surface-2"
        aria-label={`View ${profile.name}'s profile`}
      >
        <Image
          src={profile.image}
          alt={profile.imageAlt}
          fill
          sizes="(max-width: 640px) 112px, (max-width: 1024px) 176px, 205px"
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
        />
        <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/75 px-2 py-1 text-[9px] font-bold text-paper backdrop-blur sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px]">
          {profile.isDemo ? "Demo" : "18+ listing"}
        </span>
      </Link>

      <div className="flex min-w-0 flex-col p-3 sm:p-5 lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/profiles/${profile.slug}`} className="hover:text-brand">
              <h3 className="line-clamp-2 font-display text-sm font-bold leading-5 tracking-[-0.025em] text-paper sm:text-xl sm:leading-7 lg:text-2xl">
                {title}
              </h3>
            </Link>
            <p className="mt-1 line-clamp-1 text-[10px] font-extrabold uppercase tracking-[0.04em] text-brand sm:mt-1.5 sm:text-xs">
              {serviceSummary.join(" · ")}
            </p>
          </div>
          <BadgeCheck
            className="mt-0.5 hidden shrink-0 text-success sm:block"
            size={20}
            aria-label="Adult verification recorded"
          />
        </div>

        <p className="mt-2 line-clamp-3 text-[11px] leading-[1.55] text-muted sm:mt-3 sm:text-sm sm:leading-6 lg:text-base">
          {profile.shortBio}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2 sm:pt-4">
          <div className="min-w-0 space-y-1 text-[10px] text-muted sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-1 sm:space-y-0 sm:text-sm">
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="shrink-0 text-brand" size={14} />
              <span className="truncate">
                {profile.city}, {profile.state}
              </span>
            </span>
            <span className="hidden items-center gap-1.5 md:flex">
              <Languages size={14} /> {profile.languages.slice(0, 3).join(", ")}
            </span>
            <span>Age {profile.age}</span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {profile.contactPhone ? (
              <a
                href={`tel:${profile.contactPhone}`}
                aria-label={`Call ${profile.name}`}
                className="grid size-8 place-items-center rounded-lg bg-[#a6332a] text-white transition hover:-translate-y-0.5 hover:bg-[#bf3b30] sm:size-10"
              >
                <Phone size={15} fill="currentColor" />
              </a>
            ) : null}
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Message ${profile.name} on WhatsApp`}
                className="grid size-8 place-items-center rounded-lg bg-[#237a48] text-white transition hover:-translate-y-0.5 hover:bg-[#2a9156] sm:size-10"
              >
                <MessageCircle size={17} />
              </a>
            ) : null}
            {!profile.contactPhone && !whatsapp ? (
              <Link
                href={`/profiles/${profile.slug}`}
                className="rounded-lg border border-brand/45 px-2.5 py-2 text-[10px] font-bold text-brand hover:bg-brand/10 sm:px-4 sm:text-xs"
              >
                View
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
