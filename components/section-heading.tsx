export function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-balance font-display text-3xl font-bold tracking-[-0.045em] text-paper sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-muted sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
