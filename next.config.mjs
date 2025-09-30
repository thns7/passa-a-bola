/** @type {import('next').NextConfig} */

import withPWA from 'next-pwa'

const isDevelopment = process.env.NODE_ENV === 'development'

// Configuração do PWA apenas para produção
const pwaConfig = withPWA({
  dest: 'public',
  register: !isDevelopment,      // Não registrar em dev
  skipWaiting: !isDevelopment,
  disable: isDevelopment,        // Desabilita completamente em dev
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

// Aplica PWA apenas em produção
export default isDevelopment ? nextConfig : pwaConfig(nextConfig)