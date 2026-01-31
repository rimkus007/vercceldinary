// dinary-temp/dinarus/src/app/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Dashboard from "./dashboard/page";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user) {
      // Redirection si le rôle est 'MERCHANT'
      if (user.role === "MERCHANT") {
        window.location.href = "http://localhost:3000/boutique";
      }
      // Si le rôle est 'USER', l'utilisateur reste sur cette page.
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Vérification de la session...</p>
      </div>
    );
  }

  // Si le rôle est 'USER', on affiche le tableau de bord client
  if (user.role === "USER") {
    return <Dashboard />;
  }

  // Dans tous les autres cas, on affiche un écran de chargement
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirection en cours...</p>
    </div>
  );
}
