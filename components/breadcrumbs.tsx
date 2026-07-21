import Link from "next/link";

export function Breadcrumbs({ items }: { items: readonly { label: string; href?: string }[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted"
    >
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden="true" className="text-white/25">
              /
            </span>
          ) : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-paper">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-paper">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
