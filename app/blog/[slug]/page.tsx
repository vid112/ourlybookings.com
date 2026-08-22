import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getBlogPost } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost((await params).slug);
  if (!post) return {};
  const seo = post.seo;
  return {
    title: seo?.seoTitle ?? post.title,
    description: seo?.metaDescription ?? post.excerpt,
    alternates: { canonical: seo?.canonicalUrl ?? `/blog/${post.slug}` },
    robots: { index: seo?.robotsIndex ?? true, follow: seo?.robotsFollow ?? true },
    openGraph: {
      title: seo?.seoTitle ?? post.title,
      description: seo?.metaDescription ?? post.excerpt,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPost((await params).slug);
  if (!post) notFound();
  const body = typeof post.content === "string" ? post.content : post.content.body ?? "";
  return (
    <article className="section-space">
      <div className="site-container max-w-4xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }]} />
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">{post.authorName}</p>
        <h1 className="mt-4 font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">{post.title}</h1>
        <p className="mt-6 text-xl leading-8 text-muted">{post.excerpt}</p>
        <div className="mt-12 space-y-6 text-lg leading-9 text-paper/90">
          {body.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      </div>
    </article>
  );
}

export const dynamic = "force-dynamic";
