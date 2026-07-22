import { notFound } from "next/navigation";
import { AdminModule } from "@/components/admin-module";
import { adminApi } from "@/lib/api";

const modules = [
  "profiles",
  "media",
  "locations",
  "seo",
  "leads",
  "analytics",
  "settings",
] as const;
type ModuleName = (typeof modules)[number];

const moduleCopy: Record<ModuleName, { title: string; description: string }> = {
  profiles: {
    title: "Profiles",
    description: "Create, review, publish and archive profiles with verification safeguards.",
  },
  media: {
    title: "Media library",
    description: "Edit image metadata, review provenance and see every active profile usage.",
  },
  locations: {
    title: "Locations",
    description: "Manage the complete India state and city hierarchy and its publication state.",
  },
  seo: {
    title: "SEO centre",
    description: "Review metadata, redirects and images that still need useful alternative text.",
  },
  leads: {
    title: "Leads and reports",
    description: "Triage enquiries and safety reports without exposing them on the public site.",
  },
  analytics: {
    title: "Analytics",
    description: "Review privacy-conscious events collected during the last 30 days.",
  },
  settings: {
    title: "Settings",
    description: "Manage public brand and site configuration stored by the API.",
  },
};

async function loadData(module: ModuleName) {
  if (module === "profiles") {
    const [profiles, locations] = await Promise.all([
      adminApi("/admin/profiles"),
      adminApi("/admin/locations"),
    ]);
    return { profiles, locations };
  }
  if (module === "leads") {
    const [leads, reports] = await Promise.all([
      adminApi("/admin/leads"),
      adminApi("/admin/content-reports"),
    ]);
    return { leads, reports };
  }
  const paths: Record<Exclude<ModuleName, "profiles" | "leads">, string> = {
    media: "/admin/media",
    locations: "/admin/locations",
    seo: "/admin/seo",
    analytics: "/admin/analytics/summary",
    settings: "/admin/settings",
  };
  return adminApi(paths[module]);
}

export function generateStaticParams() {
  return modules.map((module) => ({ module }));
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: requestedModule } = await params;
  if (!modules.includes(requestedModule as ModuleName)) notFound();
  const moduleName = requestedModule as ModuleName;
  const data = await loadData(moduleName);
  const copy = moduleCopy[moduleName];
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Admin module</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em]">{copy.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{copy.description}</p>
        </div>
        <span
          className={`rounded-full border px-4 py-2 text-sm font-bold ${
            data === null
              ? "border-red-400/35 bg-red-400/10 text-red-200"
              : "border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
          }`}
        >
          {data === null ? "API unavailable" : "API connected"}
        </span>
      </div>
      <AdminModule module={moduleName} initialData={data} />
    </>
  );
}

export const dynamicParams = false;
