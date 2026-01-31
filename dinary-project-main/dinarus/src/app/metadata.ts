import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dinary ✨ | Portefeuille Électronique Gamifié",
  description: "💰 Application de paiement par QR code gamifiée avec récompenses, badges et défis quotidiens. Payez, gagnez et jouez !",
  keywords: [
    "paiement", 
    "QR code", 
    "portefeuille électronique", 
    "gamification", 
    "néobanque", 
    "badges", 
    "récompenses", 
    "défis quotidiens", 
    "points", 
    "niveaux"
  ],  authors: [{ name: "Dinary Team 🚀" }],
  creator: "Dinary",
  publisher: "Dinary",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Configuration de couleur adaptative pour mode clair et sombre
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" }, // Bleu pour le mode clair
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" },  // Bleu plus foncé pour le mode sombre
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/icons/apple-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },  openGraph: {
    title: "Dinary ✨ | Portefeuille Électronique Gamifié",
    description: "💰 Payez par QR code, gagnez des points, relevez des défis et débloquez des récompenses avec Dinary !",
    url: "https://dinary.app",
    siteName: "Dinary",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dinary - La banque qui vous récompense 🎮",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },  twitter: {
    card: "summary_large_image",
    title: "Dinary ✨ | La banque réinventée",
    description: "Payez, jouez, gagnez ! 🎮 L'application qui rend les paiements amusants",
    images: ["/twitter-image.jpg"],
  },
  manifest: "/manifest.json",
  category: "finance",
  other: {
    "theme-color": "#3b82f6",
    "theme-color-dark": "#1e3a8a",
    "color-scheme": "light dark",
    "msapplication-navbutton-color": "#3b82f6",
    "apple-mobile-web-app-status-bar-style": "default", // Changé de black-translucent à default pour meilleure compatibilité
    "msapplication-starturl": "/",    "apple-mobile-web-app-title": "Dinary ✨",
    "application-name": "Dinary",
  }
};