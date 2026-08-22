import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Safety and City Guides",
  description: "Helpful privacy, consent, profile and city-browsing guides.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
        <h1 className="font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
          Safety and city guides
        </h1>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="surface-border flex min-h-72 flex-col rounded-[22px] bg-surface p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Guide</p>
              <h2 className="mt-7 font-display text-2xl font-bold">{post.title}</h2>
              <p className="mt-4 leading-7 text-muted">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="mt-auto pt-8 font-bold text-brand">Read guide →</Link>
            </article>
          ))}
          {!posts.length ? <p className="text-muted">Published guides will appear here.</p> : null}
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
