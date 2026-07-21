export const siteConfig = {
  name: "Ourly Bookings",
  description:
    "India-only adult classifieds directory for independently managed profiles, privacy-first discovery and direct advertiser contact.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ourlybookings.com",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "",
} as const;

export const absoluteUrl = (path = "/") => new URL(path, siteConfig.url).toString();
