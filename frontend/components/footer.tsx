import { BadgeIndianRupee, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

const columns = [
  {
    title: "Legal",
    links: [
      ["Terms", "/terms"],
      ["Privacy", "/privacy"],
      ["Content Policy", "/content-policy"],
      ["Disclaimer", "/disclaimer"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Contact", "/contact"],
      ["Help Centre", "/help"],
      ["Blog", "/blog"],
      ["Report Content", "/report-content"],
    ],
  },
  {
    title: "Safety",
    links: [
      ["Safety Guide", "/safety"],
      ["Anti-Trafficking", "/anti-trafficking"],
      ["Consent & Takedown", "/consent-takedown"],
      ["18+ Notice", "/18-plus"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Profiles", "/profiles"],
      ["Locations", "/india"],
      ["Services", "/services"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#030405]">
      <section className="site-container -translate-y-8 rounded-[24px] border border-brand/55 bg-surface px-5 py-7 shadow-2xl shadow-black/50 sm:px-8">
        <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr_auto_auto]">
          <div className="grid size-14 place-items-center rounded-2xl border border-brand/45 text-brand">
            <BadgeIndianRupee />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">
              Ready to reach the right audience?
            </h2>
            <p className="mt-2 text-muted">
              Post a lawful adult advertisement and connect directly with people across India.
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-ink px-5 py-3 text-sm text-muted">
            🇮🇳 India only
          </div>
          <Link
            href="/post-ad"
            className="brand-gradient rounded-xl px-7 py-3.5 text-center font-bold text-white"
          >
            Post Your Ad
          </Link>
        </div>
      </section>
      <div className="site-container grid gap-12 pb-12 pt-5 lg:grid-cols-[1.4fr_3fr]">
        <div>
          <Logo />
          <div className="mt-7 inline-flex items-center gap-3 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-gold">
            <ShieldCheck size={19} /> Restricted to adults 18+
          </div>
          <p className="mt-5 max-w-sm text-sm leading-6 text-muted">
            Ourly Bookings is an advertising and discovery platform. Advertisers manage their own
            profiles and all offline communication is independent.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="font-display font-bold text-paper">{column.title}</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                {column.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-paper">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="site-container flex flex-col gap-3 py-6 text-xs leading-5 text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Ourly Bookings. Demo profiles are fictional. India only.
          </p>
          <p>Adults must follow applicable law and verify information independently.</p>
        </div>
      </div>
    </footer>
  );
}
