import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Useful for Render free tier.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    ignoreBuildErrors: true,
  },
  experimental: {
    // Optimizes memory usage during build for constrained environments like Vercel
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;
