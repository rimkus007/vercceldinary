/** @type {import('next').NextConfig} */
const nextConfig = {
  // Activer la compression Gzip pour les assets
  compress: true,
  
  // Optimisation des images
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Optimiser les polices
  optimizeFonts: true,
  
  // Configuration du routeur pour une navigation plus rapide
  experimental: {
    // Désactivation de certaines options expérimentales qui peuvent causer des problèmes
    scrollRestoration: true,
    optimisticClientCache: true,
  },
  
  // Améliorer le temps de démarrage en production
  productionBrowserSourceMaps: false,
  
  // Mettre en cache les composants statiques
  staticPageGenerationTimeout: 120,
  
  // Améliorer la réactivité du routeur
  reactStrictMode: true,
  
  // Optimisations pour les appareils mobiles
  poweredByHeader: false,
  
  // Configuration supplémentaire pour améliorer les performances
  swcMinify: true,
};

export default nextConfig;
