import type { MetadataRoute } from "next";
import { demoProfiles, indiaStates } from "@/data/india";
import { absoluteUrl } from "@/lib/site";
import { getBlogPosts } from "@/lib/blog";

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
  const now = new Date();
  const blogPosts = await getBlogPosts();
  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified: now,
      changeFrequency: route === "/" ? ("daily" as const) : ("monthly" as const),
      priority: route === "/" ? 1 : 0.7,
    })),
    ...indiaStates.map((state) => ({
      url: absoluteUrl(`/india/${state.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...indiaStates.flatMap((state) =>
      state.cities.map((stateCity) => ({
        url: absoluteUrl(`/india/${state.slug}/${stateCity.slug}`),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ),
    ...demoProfiles.map((profile) => ({
      url: absoluteUrl(`/profiles/${profile.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...blogPosts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
