

/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // i18n: {
  //   locales: ['fi', 'en'], 
  //   defaultLocale: 'fi',   
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'supa.crossmedia.fi',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);