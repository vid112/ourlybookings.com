import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="Ourly Bookings home">
      <span className="relative grid size-9 place-items-center rounded-full border border-brand/50 bg-surface-2">
        <span className="size-3 rounded-full bg-brand" />
        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-gold" />
      </span>
      <span className="font-display text-lg font-bold tracking-[-0.04em] text-paper">
        Ourly <span className="text-brand">Bookings</span>
      </span>
    </Link>
  );
}
