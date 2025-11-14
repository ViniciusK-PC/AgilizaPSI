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
    domains: ['cdn.tailgrids.com'],
  },
};

module.exports = withFlowbiteReact(nextConfig);