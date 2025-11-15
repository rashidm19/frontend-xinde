/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const DEFAULT_LOCALE = 'en';

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: `/${DEFAULT_LOCALE}/profile`,
        permanent: false,
      },
      {
        source: '/en',
        destination: '/en/profile',
        permanent: false,
      },
      {
        source: '/ru',
        destination: '/ru/profile',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
