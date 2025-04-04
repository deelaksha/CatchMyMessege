import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enables React strict mode for better debugging
  swcMinify: true, // Enables SWC for faster builds
  eslint: {
    ignoreDuringBuilds: true, // Prevents ESLint errors from breaking Vercel builds
  },
  typescript: {
    ignoreBuildErrors: true, // Prevents TypeScript errors from breaking builds
  },
  images: {
    domains: ["firebasestorage.googleapis.com"], // Allows Firebase Storage images
  },
};

export default nextConfig;
