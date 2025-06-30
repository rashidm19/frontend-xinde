/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  env: {
    ENVIROMENT: process.env.ENVIROMENT,
  },
  async redirects() {
    return [
      {
        source: '/ru',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/en',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
