/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'https://supa.crossmedia.fi',
          port: '',
          pathname: '/storage/v1/object/public/**',
        },
      ],
    },
};

export default nextConfig;
