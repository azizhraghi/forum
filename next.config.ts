import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [{ source: '/campus', destination: '/#participer', permanent: false }];
  },
};

export default config;
