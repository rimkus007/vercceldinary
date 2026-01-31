/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  // Configuration Turbopack pour Next.js 16
  turbopack: {
    // Configuration Turbopack vide pour éviter l'erreur
  },
  // IMPORTANT : ne pas surcharger config.output.publicPath/chunkFilename
  assetPrefix: isProd ? process.env.NEXT_PUBLIC_ASSET_PREFIX || "" : "",
  webpack: (config) => {
    // Si tu avais des lignes du style :
    //   config.output.publicPath = ...
    //   config.output.chunkFilename = ...
    //   config.output.filename = ...
    // supprime-les. Laisse Next gérer ces valeurs.
    return config;
  },
};

module.exports = nextConfig;
