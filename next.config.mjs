

/** @type {import('next').NextConfig} */

const nextConfig = {
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

export default nextConfig;