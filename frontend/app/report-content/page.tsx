import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SubmissionForm } from "@/components/submission-form";

export const metadata: Metadata = {
  title: "Report Content",
  description:
    "Report suspected non-consensual, unlawful, stolen or misleading content for urgent review.",
  alternates: { canonical: "/report-content" },
  robots: { index: true, follow: true },
};

export default function ReportContentPage() {
  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Report Content" }]} />
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
              Safety priority
            </p>
            <h1 className="mt-4 text-balance font-display text-5xl font-bold tracking-[-0.055em]">
              Report content for urgent review
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted">
              Report minors, coercion, trafficking, stolen media, impersonation, non-consensual
              content or other suspected violations. Immediate danger should be reported to local
              emergency services.
            </p>
          </div>
          <SubmissionForm kind="report" />
        </div>
      </div>
    </div>
  );
}
