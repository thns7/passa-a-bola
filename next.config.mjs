/** @type {import('next').NextConfig} */

import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' 
})

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['placehold.co', 'picsum.photos'],
  },
  experimental: {
    optimizeCss: false,
  },
}

export default pwaConfig(nextConfig)