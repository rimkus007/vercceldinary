// src/app/page.tsx

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RootPage() {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        // L'utilisateur est connecté, le rediriger vers le tableau de bord
        router.push("/dashboard");
      } else {
        // L'utilisateur n'est pas connecté, le rediriger vers la page de login externe
        // Utilise la même URL centrale que dans AuthContext
        const centralLoginUrl =
          process.env.NEXT_PUBLIC_CENTRAL_LOGIN_URL ||
          "http://localhost:3000/login";
        window.location.href = centralLoginUrl;
      }
    }
  }, [token, isLoading, router]);

  // Affiche un état de chargement pendant la vérification
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
