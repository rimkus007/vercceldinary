"use client";
// dinary-temp/dinarus/src/app/layout.tsx

import React, { useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationsProvider } from "@/components/common/NotificationsContext";
import GlobalNotificationsModal from "@/components/modals/GlobalNotificationsModal";
import { ReferralProvider } from "@/components/common/ReferralContext";
import { ProfileModalProvider } from "@/components/common/ProfileModalContext";
import BottomNavbar from "@/components/layouts/BottomNavbar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.title = "Dinary App";
  }, []);

  return (
    <html lang="fr">
      <head>
        <title>Dinary App</title>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <NotificationsProvider>
            <ProfileModalProvider>
              <ReferralProvider>
                <div className="flex flex-col min-h-screen">
                  {/* Notifications Modal (global, now inside provider tree) */}
                  <GlobalNotificationsModal />
                  <div className="flex-grow">{children}</div>
                  <BottomNavbar />
                </div>
              </ReferralProvider>
            </ProfileModalProvider>
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
