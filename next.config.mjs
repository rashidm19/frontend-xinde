/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const DEFAULT_LOCALE = 'en';

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: `/${DEFAULT_LOCALE}/dashboard`,
        permanent: false,
      },
      {
        source: '/en',
        destination: '/en/dashboard',
        permanent: false,
      },
      {
        source: '/ru',
        destination: '/ru/dashboard',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:locale/docs/:path*',
        destination: '/docs/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
