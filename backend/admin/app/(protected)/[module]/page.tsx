import { notFound } from "next/navigation";

const modules: Record<string, { title: string; description: string; actions: string[] }> = {
  profiles: {
    title: "Profiles",
    description: "Draft, verify, publish, schedule, archive and safely unpublish profiles.",
    actions: ["Create profile", "Review verification", "Manage media", "Edit SEO", "Publish"],
  },
  media: {
    title: "Media library",
    description: "Signed Cloudinary images and videos with rights, SEO and usage metadata.",
    actions: [
      "Upload media",
      "Edit alt text",
      "Set focal point",
      "Check usage",
      "Controlled delete",
    ],
  },
  locations: {
    title: "Locations",
    description:
      "India state, city and area hierarchy with publish controls and original local content.",
    actions: ["Add city", "Edit introduction", "Check thin pages", "Review profiles", "Publish"],
  },
  seo: {
    title: "SEO centre",
    description:
      "Metadata, redirects, sitemap state, missing alt text and content-quality reports.",
    actions: [
      "Metadata audit",
      "Redirect history",
      "Sitemap status",
      "Orphan pages",
      "Structured data",
    ],
  },
  leads: {
    title: "Leads and reports",
    description: "Private enquiries, ad submissions and content reports with retention controls.",
    actions: [
      "Triage leads",
      "Review reports",
      "Export CSV",
      "Update status",
      "Delete expired data",
    ],
  },
  analytics: {
    title: "Analytics",
    description: "Privacy-conscious sessions, events, locations and conversion funnels.",
    actions: ["Date range", "Compare period", "Top profiles", "Top locations", "Export"],
  },
  settings: {
    title: "Settings",
    description:
      "Brand, contacts, legal text, integrations, roles and environment-backed services.",
    actions: ["Brand", "Contacts", "Cloudinary", "SMTP", "Roles"],
  },
};

export function generateStaticParams() {
  return Object.keys(modules).map((module) => ({ module }));
}
export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const content = modules[module];
  if (!content) notFound();
  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Admin module</p>
      <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em]">{content.title}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{content.description}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {content.actions.map((action) => (
          <div
            key={action}
            className="rounded-[18px] border border-white/12 bg-surface p-5 font-semibold text-paper"
          >
            {action}
            <p className="mt-2 text-sm font-normal text-muted">
              Connected through authenticated `/api/v1/admin` endpoints.
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
export const dynamicParams = false;
