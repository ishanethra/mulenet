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
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Disable Webpack cache to reduce memory usage during build
    config.cache = false;
    return config;
  },
};

export default nextConfig;
