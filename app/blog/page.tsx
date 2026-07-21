import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
export const metadata: Metadata = {
  title: "Safety and City Guides",
  description: "Helpful privacy, consent, profile and city-browsing guides.",
  alternates: { canonical: "/blog" },
};
const posts = [
  [
    "Meeting safely for the first time",
    "Consent, communication and public-meeting considerations for adults.",
  ],
  [
    "Protecting personal information",
    "A practical guide to safer messaging and data minimization.",
  ],
  [
    "Recognizing suspicious advertisements",
    "Common warning signs and how to submit a useful content report.",
  ],
  [
    "Creating a compliant profile",
    "Verification, consent, media ownership and accurate profile fields.",
  ],
  [
    "How location pages work",
    "Why useful, unique city content matters more than mass-generated pages.",
  ],
  ["Media rights and takedowns", "What advertisers should know before uploading photos or video."],
];
export default function BlogPage() {
  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
        <h1 className="font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
          Safety and city guides
        </h1>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(([title, copy]) => (
            <article
              key={title}
              className="surface-border flex min-h-72 flex-col rounded-[22px] bg-surface p-7"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Guide</p>
              <h2 className="mt-7 font-display text-2xl font-bold">{title}</h2>
              <p className="mt-4 leading-7 text-muted">{copy}</p>
              <Link href="/blog" className="mt-auto pt-8 font-bold text-brand">
                Read guide →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
