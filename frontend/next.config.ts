import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(projectRoot, "..");
const turbopackRoot = existsSync(path.join(workspaceRoot, "pnpm-workspace.yaml")) ? workspaceRoot : projectRoot;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [{ pathname: "/images/**" }],
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: "https", hostname: "api.ourlybookings.com", pathname: "/api/v1/public/media/**" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.schloka.com" },
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/uploads/**" },
    ],
  },
  turbopack: { root: turbopackRoot },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ourlybookings.com" }],
        destination: "https://ourlybookings.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
