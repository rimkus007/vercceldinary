"use client";
import BottomNavbar from "@/components/layouts/BottomNavbar";
import { AuthProvider } from "@/context/AuthContext";
import VerificationBanner from "@/components/common/VerificationBanner"; // <-- 1. IMPORTER LA BANNIÈRE

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-gray-50">
        <main className="pb-24">
          <VerificationBanner /> {/* <-- 2. AJOUTER LA BANNIÈRE ICI */}
          {children}
        </main>
        <BottomNavbar />
      </div>
    </AuthProvider>
  );
}
