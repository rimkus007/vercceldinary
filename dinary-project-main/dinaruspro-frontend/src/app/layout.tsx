// Fichier : dinaruspro-seller/src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationsProvider } from "@/components/common/NotificationsContext";

// 1. On importe le composant BottomNavbar que tu as déjà créé
import BottomNavbar from "@/components/layouts/BottomNavbar";
import Notifications from "@/components/Notifications";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dinary App",
  description: "Votre espace vendeur Dinary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationsProvider>
            {/* 2. On ajoute une div pour s'assurer que le contenu ne soit pas caché */}
            <div className="pb-16 relative">
              {/* Composant de notifications en haut à droite */}
              <div className="fixed top-4 right-4 z-40">
                <Notifications />
              </div>
              {children}
            </div>

            {/* 3. On ajoute la barre de navigation ici */}
            <BottomNavbar />
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
