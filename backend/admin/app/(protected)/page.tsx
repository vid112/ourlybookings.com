import { AlertTriangle, BarChart3, FileText, UsersRound } from "lucide-react";
import { adminApi } from "@/lib/api";

type Summary = {
  profiles: number;
  newLeads: number;
  openReports: number;
  eventsLast24Hours: number;
};
export default async function DashboardPage() {
  const data = await adminApi<Summary>("/admin/dashboard");
  const cards = [
    [UsersRound, "Profiles", data?.profiles ?? "—"],
    [FileText, "New leads", data?.newLeads ?? "—"],
    [AlertTriangle, "Open reports", data?.openReports ?? "—"],
    [BarChart3, "Events / 24h", data?.eventsLast24Hours ?? "—"],
  ] as const;
  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Operations</p>
      <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em]">Dashboard</h1>
      <p className="mt-4 text-muted">
        Publishing, safety and conversion signals from the NestJS API.
      </p>
      {!data ? (
        <div className="mt-8 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          API data is unavailable. Start the API and database to load live metrics.
        </div>
      ) : null}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, label, value]) => (
          <article key={label} className="rounded-[20px] border border-white/12 bg-surface p-6">
            <Icon className="text-brand" />
            <p className="mt-8 text-sm text-muted">{label}</p>
            <p className="mt-2 text-4xl font-bold">{value}</p>
          </article>
        ))}
      </div>
    </>
  );
}
