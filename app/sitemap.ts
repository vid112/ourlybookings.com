import type { MetadataRoute } from "next";

import { indiaStates } from "@/data/india";
import { absoluteUrl } from "@/lib/site";
import { getBlogPosts } from "@/lib/blog";
import { getPublicProfilesForSitemap } from "@/lib/profiles-sitemap";

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
  "/report-content",
  "/anti-trafficking",
  "/consent-takedown",
  "/18-plus",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profiles, blogPosts] = await Promise.all([
    getPublicProfilesForSitemap(),
    getBlogPosts(),
  ]);

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route),
  }));

  const statePages: MetadataRoute.Sitemap = indiaStates.map((state) => ({
    url: absoluteUrl(`/india/${state.slug}`),
  }));

  const cityPages: MetadataRoute.Sitemap = indiaStates.flatMap((state) =>
    state.cities.map((city) => ({
      url: absoluteUrl(`/india/${state.slug}/${city.slug}`),
    }))
  );

  const profilePages: MetadataRoute.Sitemap = profiles.map((profile) => ({
    url: absoluteUrl(`/profiles/${profile.slug}`),

    ...(profile.updatedAt && {
      lastModified: new Date(profile.updatedAt),
    }),
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),

    ...(post.publishedAt && {
      lastModified: new Date(post.publishedAt),
    }),
  }));

  return [
    ...staticPages,
    ...statePages,
    ...cityPages,
    ...profilePages,
    ...blogPages,
  ];
}
