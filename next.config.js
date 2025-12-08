// import type { NextConfig } from "next";
// import withFlowbiteReact from "flowbite-react/plugin/nextjs";

// const config: NextConfig = {
//   reactStrictMode: true,
//   images: {
//     domains: ['cdn.tailgrids.com'],
//   },
// };

// export default withFlowbiteReact(config);

/** @type {import('next').NextConfig} */
const withFlowbiteReact = require("flowbite-react/plugin/nextjs");

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.tailgrids.com', 'tailwindcss.com', 'www.floatui.com'],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/.prisma/client/**/*'],
      '/*': ['./node_modules/.prisma/client/**/*'],
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Melhorar geração de chunks
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Redirecionar rotas antigas para evitar 404
  async redirects() {
    return [
      {
        source: '/index.htm',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = withFlowbiteReact(nextConfig);