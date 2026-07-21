import { BadgeCheck, Languages, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { DemoProfile } from "@/data/india";

export function ProfileCard({ profile }: { profile: DemoProfile }) {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-white/12 bg-surface transition hover:-translate-y-1 hover:border-brand/45">
      <Link href={`/profiles/${profile.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
          <Image
            src={profile.image}
            alt={profile.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
          />
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/75 px-3 py-1.5 text-xs font-bold text-paper backdrop-blur">
            Demo profile
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-bold tracking-[-0.04em] text-paper">
                {profile.name}, {profile.age}
              </h3>
              <p className="mt-1 text-sm font-semibold text-brand">{profile.category}</p>
            </div>
            <BadgeCheck
              className="mt-1 text-success"
              size={20}
              aria-label="Adult verification recorded"
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <MapPin size={15} /> {profile.city}
            </span>
            <span className="inline-flex items-center gap-2">
              <Languages size={15} /> {profile.languages.join(", ")}
            </span>
          </div>
          <p className="mt-4 line-clamp-2 leading-6 text-muted">{profile.shortBio}</p>
          <span className="mt-5 inline-flex font-bold text-paper group-hover:text-brand">
            View profile →
          </span>
        </div>
      </Link>
    </article>
  );
}
