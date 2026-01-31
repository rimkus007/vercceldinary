// dinary-temp/dashboard/app/admin/AdminWrapper.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminWrapper({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // On attend que le chargement soit terminé
    if (!isLoading) {
      // Si l'utilisateur n'existe pas ou n'est pas un admin, on redirige
      if (!user || user.role !== "ADMIN") {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  // Pendant le chargement, on affiche un écran de chargement.
  // Si après chargement l'utilisateur n'est pas un admin, il sera redirigé par le useEffect.
  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Vérification de l'autorisation...</p>
      </div>
    );
  }

  // Si tout est bon, on affiche la page
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <AdminHeader />{" "}
        {/* On n'a plus besoin de passer 'user' ici si AdminHeader utilise aussi useAuth */}
        <main className="flex-1 p-6 ml-16">{children}</main>
      </div>
    </div>
  );
}
