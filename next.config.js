/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore optional platform-specific dependencies
      config.resolve = config.resolve || {}
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'osx-temperature-sensor': false,
      }
    }
    return config
  },
}

module.exports = nextConfig

