import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Session proxy and headers land in FE-008 / FE-059.
};

export default nextConfig;
