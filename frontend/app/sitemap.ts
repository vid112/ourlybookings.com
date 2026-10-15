import type { MetadataRoute } from "next";

import { indiaStates } from "@/data/india";
import { absoluteUrl } from "@/lib/site";
import { getBlogPosts } from "@/lib/blog";
import { getProfilesForSitemap } from "@/lib/directory";

export const revalidate = 3600;

const staticRoutes = [
  "/",
  "/profiles",
  "/india",
  "/services",
  "/gallery",
  "/rates",
  "/about",
  "/blog",
  "/contact",
  "/safety",
  "/terms",
  "/privacy",
  "/content-policy",
  "/disclaimer",
  "/anti-trafficking",
  "/consent-takedown",
  "/18-plus",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profiles, blogPosts] = await Promise.all([
    getProfilesForSitemap(),
    getBlogPosts(),
  ]);

  const currentDate = new Date();

  // Core Static Pages
  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: currentDate,
    changeFrequency: route === "/" ? "daily" : "monthly",
    priority: route === "/" ? 1.0 : 0.6,
  }));

  // Indian States (High Priority for State-wide Searches)
  const statePages: MetadataRoute.Sitemap = indiaStates.map((state) => ({
    url: absoluteUrl(`/india/${state.slug}`),
    lastModified: currentDate,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // All Indian Cities (Top Crawl Priority - matches user intent)
  const cityPages: MetadataRoute.Sitemap = indiaStates.flatMap((state) =>
    state.cities.map((city) => ({
      url: absoluteUrl(`/india/${state.slug}/${city.slug}`),
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    }))
  );

  // Individual Profiles
  const profilePages: MetadataRoute.Sitemap = profiles.map((profile) => ({
    url: absoluteUrl(`/profiles/${profile.slug}`),
    lastModified: profile.updatedAt ? new Date(profile.updatedAt) : currentDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // SEO Blog Posts
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.publishedAt ? new Date(post.publishedAt) : currentDate,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...statePages,
    ...cityPages,
    ...profilePages,
    ...blogPages,
  ];
}
