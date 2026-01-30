/** @type {import('next').NextConfig} */
const nextConfig = {
  // AGGRESSIVE: Limit pages kept in memory for large projects (241 API routes)
  onDemandEntries: {
    maxInactiveAge: 15 * 1000, // 15 seconds (more aggressive)
    pagesBufferLength: 1, // Only 1 page in memory (more aggressive)
  },

  // Reduce image optimization cache
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Reduced from 8 to 6
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Reduced from 8 to 7
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
    ],
  },

  // Disable source maps in production
  productionBrowserSourceMaps: false,

  // Webpack optimizations for development
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable webpack cache in development to save memory
      config.cache = false;
      
      // Reduce memory usage in development
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      };
    }
    return config;
  },

  // Experimental features for memory optimization
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      'lucide-react', 
      'react-icons', 
      'framer-motion',
      '@headlessui/react',
      'recharts'
    ],
  },

  // For Next.js 16+: Add empty turbopack config
  turbopack: {},
};

export default nextConfig;
