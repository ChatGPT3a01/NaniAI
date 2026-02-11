import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "pdf-parse"],
  turbopack: {},
  devIndicators: false,
};

export default nextConfig;
