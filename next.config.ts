import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    reactCompiler: true,
    optimizePackageImports: ["@testing-library/react"],
  },
};

export default nextConfig;
