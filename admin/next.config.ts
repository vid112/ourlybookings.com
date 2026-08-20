import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(projectRoot, "../..");
const turbopackRoot = existsSync(path.join(workspaceRoot, "pnpm-workspace.yaml")) ? workspaceRoot : projectRoot;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: turbopackRoot },
};
export default nextConfig;
