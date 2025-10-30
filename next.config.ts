import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.tailgrids.com'],
  }
};

export default config;