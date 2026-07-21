import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section-space">
      <div className="site-container max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">404</p>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-[-0.055em]">
          This page is not available
        </h1>
        <p className="mt-6 leading-8 text-muted">
          The location, profile or guide may be unpublished, removed or mistyped.
        </p>
        <div className="mt-9 flex justify-center gap-3">
          <Link href="/" className="brand-gradient rounded-xl px-6 py-3.5 font-bold">
            Go home
          </Link>
          <Link
            href="/india"
            className="rounded-xl border border-white/15 px-6 py-3.5 font-bold text-muted"
          >
            Browse India
          </Link>
        </div>
      </div>
    </div>
  );
}
