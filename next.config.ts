import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      { // This is the new pattern for Google Cloud Storage
        protocol: 'https', // GCS serves over HTTPS
        hostname: 'storage.googleapis.com',
        port: '', // No specific port for GCS
        pathname: '/**', // Allow any path within storage.googleapis.com
      },
      // You might also need to add your specific Firebase Storage domain if it's not storage.googleapis.com
      // For example, if your bucket is dr-lojis-dental-hub.firebasestorage.app
      // {
      //   protocol: 'https',
      //   hostname: 'dr-lojis-dental-hub.firebasestorage.app',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
};

export default nextConfig;
