import type { Metadata } from "next";
import { CalendarHeart, HeartHandshake, MessageCircleMore, Plane, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore non-explicit service categories offered by independently managed adult advertisers.",
  alternates: { canonical: "/services" },
};
const items = [
  [
    HeartHandshake,
    "Companionship",
    "Independent adult companionship listings with direct advertiser communication.",
  ],
  [
    CalendarHeart,
    "Dinner and events",
    "Social companionship for meals and public events, subject to advertiser terms.",
  ],
  [
    Plane,
    "Travel companion",
    "Travel-related listings requiring clear itineraries, consent and lawful arrangements.",
  ],
  [
    MessageCircleMore,
    "Conversation",
    "Privacy-first direct contact and clear expectations before any meeting.",
  ],
  [
    Sparkles,
    "Wellness listings",
    "Adult-only massage and wellness advertising where lawful and accurately described.",
  ],
] as const;
export default function ServicesPage() {
  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }]} />
        <div className="max-w-4xl">
          <h1 className="font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
            Independent service categories
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted">
            Ourly Bookings publishes advertisements; it does not provide, arrange or guarantee
            services. Category language must remain accurate, lawful and controlled through the
            admin system.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {items.map(([Icon, title, copy]) => (
            <article key={title} className="surface-border rounded-[22px] bg-surface p-7">
              <Icon className="text-brand" size={30} />
              <h2 className="mt-10 font-display text-2xl font-bold">{title}</h2>
              <p className="mt-4 leading-7 text-muted">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
