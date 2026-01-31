/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Ajout de paramètres pour améliorer la stabilité pendant le développement
  reactStrictMode: true,
  swcMinify: true,
  // Augmenter la limite de taille pour les pages
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
  }
};

export default nextConfig;