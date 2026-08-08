"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";

const navigation = [
  ["Profiles", "/profiles"],
  ["Locations", "/india"],
  ["Services", "/services"],
  ["Safety", "/safety"],
  ["Blog", "/blog"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/92 backdrop-blur-xl">
      <div className="site-container flex h-18 items-center justify-between gap-6">
        <Logo />
        <nav
          className="hidden items-center gap-7 text-sm font-semibold text-muted lg:flex"
          aria-label="Primary navigation"
        >
          {navigation.map(([label, href]) => (
            <Link key={href} className="link-underline py-2 hover:text-paper" href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <span className="rounded-xl border border-white/12 px-3 py-2 text-xs text-muted">
            🇮🇳 India
          </span>
          <Link href="/account" className="rounded-xl border border-white/12 px-4 py-3 text-sm font-bold text-muted hover:text-paper">My Ads</Link>
          <Link
            href="/post-ad"
            className="brand-gradient rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand/15 hover:brightness-110"
          >
            Post Your Ad
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="grid size-11 place-items-center rounded-xl border border-white/15 text-paper lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-navigation"
          className="border-t border-white/10 bg-surface px-4 py-5 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="site-container grid gap-2">
            {navigation.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold text-muted hover:bg-white/5 hover:text-paper"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/post-ad"
              onClick={() => setOpen(false)}
              className="brand-gradient mt-2 rounded-xl px-4 py-3 text-center font-bold"
            >
              Post Your Ad
            </Link>
            <Link href="/account" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-center font-bold text-muted">My Ads / Login</Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
