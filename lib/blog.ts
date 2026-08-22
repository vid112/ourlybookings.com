const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: { body?: string } | string;
  authorName: string;
  publishedAt?: string;
  seo?: {
    seoTitle: string;
    metaDescription: string;
    canonicalUrl?: string;
    robotsIndex: boolean;
    robotsFollow: boolean;
    focusKeyword?: string;
  } | null;
};

async function blogApi<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${apiUrl}${path}`, { cache: "no-store" });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function getBlogPosts() {
  return (await blogApi<BlogPost[]>("/public/blog")) ?? [];
}

export async function getBlogPost(slug: string) {
  return blogApi<BlogPost>(`/public/blog/${encodeURIComponent(slug)}`);
}
