import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SubmissionForm } from "@/components/submission-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a private support or platform enquiry to Ourly Bookings.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <h1 className="font-display text-5xl font-bold tracking-[-0.055em]">
              Contact Ourly Bookings
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted">
              Use this form for platform support, profile questions or publishing help. Submitted
              enquiries are private and never appear publicly.
            </p>
          </div>
          <SubmissionForm kind="contact" />
        </div>
      </div>
    </div>
  );
}
