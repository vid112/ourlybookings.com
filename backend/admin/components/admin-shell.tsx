import {
  BarChart3,
  FileSearch,
  Images,
  LayoutDashboard,
  LayoutGrid,
  MapPinned,
  SearchCheck,
  Settings,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

const nav = [
  [LayoutDashboard, "Dashboard", "/"],
  [UserRoundCog, "Profiles", "/profiles"],
  [UsersRound, "Users", "/users"],
  [LayoutGrid, "Categories", "/categories"],
  [Images, "Media", "/media"],
  [MapPinned, "Locations", "/locations"],
  [SearchCheck, "SEO centre", "/seo"],
  [FileSearch, "Leads & reports", "/leads"],
  [BarChart3, "Analytics", "/analytics"],
  [Settings, "Settings", "/settings"],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-white/10 bg-surface p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="text-xl font-bold tracking-[-0.04em]">
          Ourly <span className="text-brand">Admin</span>
        </div>
        <nav
          className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1"
          aria-label="Admin navigation"
        >
          {nav.map(([Icon, label, href]) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-muted hover:bg-white/5 hover:text-paper"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="p-5 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
