/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  env: {
    ENVIROMENT: process.env.ENVIROMENT,
  },
};

export default withNextIntl(nextConfig);
