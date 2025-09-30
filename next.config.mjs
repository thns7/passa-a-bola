/** @type {import('next').NextConfig} */

import withPWA from 'next-pwa'

const isDevelopment = process.env.NODE_ENV === 'development'


const pwaConfig = withPWA({
  dest: 'public',
  register: !isDevelopment,      
  skipWaiting: !isDevelopment,
  disable: isDevelopment,        
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


export default isDevelopment ? nextConfig : pwaConfig(nextConfig)