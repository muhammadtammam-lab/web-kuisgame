import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konfigurasi Next.js 15
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  eslint: {
    // Abaikan warning img element saat build
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;