/** @type {import('next').NextConfig} */
const nextconfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextconfig;
