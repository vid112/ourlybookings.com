import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how Ourly Bookings is designed as a consent-first India adult classifieds platform.",
  alternates: { canonical: "/about" },
};
export default function AboutPage() {
  return (
    <div className="section-space">
      <div className="site-container max-w-4xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
        <h1 className="font-display text-5xl font-bold tracking-[-0.055em]">
          A safer foundation for adult classifieds
        </h1>
        <div className="mt-9 space-y-7 text-lg leading-9 text-muted">
          <p>
            Ourly Bookings is being built as an India-only advertising and discovery platform for
            independently managed adult profiles. It is not an escort agency, booking service or
            party to offline arrangements.
          </p>
          <p>
            The product architecture prioritizes adult verification records, consent evidence, media
            rights, content reporting, controlled unpublishing, private lead handling, accessibility
            and crawlable city navigation.
          </p>
          <p>
            All current profile records are fictional demo content. Launch requires licensed media,
            verified adults, real company information, configured support contacts and legal review.
          </p>
        </div>
      </div>
    </div>
  );
}
