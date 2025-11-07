import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.tailgrids.com'],
  }
};

export default withFlowbiteReact(config);