import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";

type ContentPage = {
  title: string;
  description: string;
  sections: readonly { heading: string; body: string }[];
};

const pages: Record<string, ContentPage> = {
  terms: {
    title: "Terms of Use",
    description: "Platform rules for visitors and independent adult advertisers.",
    sections: [
      {
        heading: "Platform role",
        body: "Ourly Bookings is an advertising and discovery platform. It does not provide services, arrange meetings, process private payments or participate in offline arrangements.",
      },
      {
        heading: "Adult access",
        body: "The platform is restricted to adults aged 18 or older. Advertisers must be adults, provide informed consent and have the legal right to publish every submitted detail and media asset.",
      },
      {
        heading: "Prohibited use",
        body: "Minors, coercion, trafficking, stolen media, impersonation, hidden-camera content, non-consensual intimate content, unlawful services and misleading claims are prohibited.",
      },
      {
        heading: "Independent responsibility",
        body: "Users remain responsible for verifying information, communicating respectfully, obtaining consent and following all applicable national, state and local laws.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description: "How Ourly Bookings handles profile, enquiry, analytics and verification data.",
    sections: [
      {
        heading: "Data minimization",
        body: "The platform collects only the information needed to publish approved profiles, respond to enquiries, secure accounts, measure anonymous activity and meet legal obligations.",
      },
      {
        heading: "Sensitive verification data",
        body: "Identity and adult-verification evidence is private, access-controlled and never exposed through public APIs or profile pages.",
      },
      {
        heading: "Analytics",
        body: "First-party analytics uses an anonymous session identifier, coarse device and location information, referrer and conversion events. Raw IP addresses should not be retained longer than operationally necessary.",
      },
      {
        heading: "Rights and deletion",
        body: "Verified data subjects can request access, correction, unpublishing or deletion through support, subject to lawful retention and dispute-handling requirements.",
      },
    ],
  },
  "content-policy": {
    title: "Content Policy",
    description: "Publication, consent, accuracy and prohibited-content standards.",
    sections: [
      {
        heading: "Required evidence",
        body: "Every person shown must be an adult, consent to publication and have a private verification record. Uploaders must own or license every image, video and written detail.",
      },
      {
        heading: "Accuracy",
        body: "Profiles must not contain misleading identity, location, availability, verification, pricing or service claims. Editors may request evidence or reject incomplete submissions.",
      },
      {
        heading: "Prohibited content",
        body: "Content involving minors, coercion, trafficking, non-consensual media, hidden cameras, stolen assets, public impersonation, harassment or unlawful services is forbidden.",
      },
      {
        heading: "Enforcement",
        body: "Administrators can draft, reject, archive, urgently unpublish and soft-delete records. All sensitive publishing and deletion actions are recorded in the audit log.",
      },
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    description: "Important limits of the Ourly Bookings advertising platform.",
    sections: [
      {
        heading: "Advertising platform only",
        body: "Ourly Bookings does not employ advertisers, provide escort services, arrange bookings or guarantee any profile, communication or private arrangement.",
      },
      {
        heading: "No ranking guarantee",
        body: "The codebase supports crawlability and technical SEO, but no developer or platform can guarantee a specific search ranking or commercial result.",
      },
      {
        heading: "Legal review required",
        body: "Indian counsel must review the final business model, service language, intermediary obligations, privacy practices and applicable national, state and local rules before launch.",
      },
    ],
  },
  "anti-trafficking": {
    title: "Anti-Trafficking Statement",
    description: "Zero-tolerance policy for trafficking, coercion and exploitation.",
    sections: [
      {
        heading: "Zero tolerance",
        body: "Ourly Bookings prohibits trafficking, coercion, exploitation, threats, debt bondage and any listing involving a minor.",
      },
      {
        heading: "Detection and escalation",
        body: "Suspicious content can be urgently unpublished while trained reviewers preserve audit evidence and escalate credible immediate danger to appropriate authorities.",
      },
      {
        heading: "How to report",
        body: "Use the Report Content form with the page URL and specific concern. If someone faces immediate danger, contact local emergency services first.",
      },
    ],
  },
  "consent-takedown": {
    title: "Consent and Takedown Policy",
    description: "How consent records, disputes and media removal requests are handled.",
    sections: [
      {
        heading: "Publication consent",
        body: "A profile cannot be published until informed consent and media-rights evidence are recorded privately by an authorized reviewer.",
      },
      {
        heading: "Urgent unpublishing",
        body: "A credible consent dispute, stolen-media report or safety concern can trigger immediate temporary unpublishing while ownership and identity are reviewed.",
      },
      {
        heading: "Resolution",
        body: "Reviewers document the evidence, actions, communications and final decision. Removed media is deleted through a controlled Cloudinary workflow only after reference checks.",
      },
    ],
  },
  "18-plus": {
    title: "18+ Adult Content Notice",
    description: "Access and participation rules for adults only.",
    sections: [
      {
        heading: "Adults only",
        body: "You must be at least 18 years old, or older where local law requires, to access adult profile areas or submit an advertisement.",
      },
      {
        heading: "No minors",
        body: "Content featuring, describing or seeking minors is strictly prohibited and is subject to urgent removal and escalation.",
      },
      {
        heading: "Responsible access",
        body: "By entering, visitors accept the platform terms and remain responsible for following applicable law and respecting consent and privacy.",
      },
    ],
  },
  help: {
    title: "Help Centre",
    description: "Quick answers for browsing, publishing, privacy and content reports.",
    sections: [
      {
        heading: "Browsing",
        body: "Use the India page to select a state, then choose a city. Profile filters are rendered on the server so public pages remain accessible and crawlable.",
      },
      {
        heading: "Publishing",
        body: "Submit the Post Your Ad form. An administrator will request private adult-verification, consent and media-rights evidence before publication.",
      },
      {
        heading: "Safety reports",
        body: "Use Report Content for suspected abuse, stolen media or impersonation. Support enquiries and safety reports are never displayed publicly.",
      },
    ],
  },
};

type ContentPageProps = { params: Promise<{ contentSlug: string }> };

export function generateStaticParams() {
  return Object.keys(pages).map((contentSlug) => ({ contentSlug }));
}

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const { contentSlug } = await params;
  const page = pages[contentSlug];
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${contentSlug}` },
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { contentSlug } = await params;
  const page = pages[contentSlug];
  if (!page) notFound();

  return (
    <div className="section-space">
      <div className="site-container max-w-4xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title }]} />
        <h1 className="text-balance font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
          {page.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted">{page.description}</p>
        <div className="mt-14 divide-y divide-white/12 border-y border-white/12">
          {page.sections.map((section) => (
            <section key={section.heading} className="py-9">
              <h2 className="font-display text-2xl font-bold">{section.heading}</h2>
              <p className="mt-4 leading-8 text-muted">{section.body}</p>
            </section>
          ))}
        </div>
        {contentSlug === "anti-trafficking" || contentSlug === "consent-takedown" ? (
          <Link
            href="/report-content"
            className="brand-gradient mt-10 inline-block rounded-xl px-7 py-4 font-bold"
          >
            Report content
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export const dynamicParams = false;
