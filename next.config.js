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
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.tailgrids.com', 'tailwindcss.com', 'www.floatui.com'],
    dangerouslyAllowSVG: true,
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/.prisma/client/**/*'],
    '/*': ['./node_modules/.prisma/client/**/*'],
  },
};



export default withFlowbiteReact(nextConfig);