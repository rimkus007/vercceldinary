// dinaruspro-seller/src/components/ProfileClient.tsx

"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfileClient() {
  const { merchantProfile, isLoading, logout, token } = useAuth();
  const router = useRouter();

  // Si le chargement est en cours, on ne fait rien (le AuthContext affiche déjà un message)
  if (isLoading) {
    return null;
  }

  // Si le chargement est terminé et qu'il n'y a pas de token, on redirige vers la page de connexion
  if (!token) {
    router.push("/");
    return null;
  }

  // Si l'utilisateur est connecté mais n'a pas de profil commerçant
  if (!merchantProfile) {
    return (
      <div className="text-center p-8">
        <h1 className="text-xl font-bold mb-4">Profil commerçant non trouvé</h1>
        <p>
          Votre compte utilisateur est valide, mais aucun profil commerçant n'y
          est associé.
        </p>
        {/* Tu pourrais ajouter un bouton pour en créer un */}
        <button
          onClick={logout}
          className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
        >
          Déconnexion
        </button>
      </div>
    );
  }

  // Si tout va bien, on affiche le profil
  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Bienvenue, {merchantProfile.name} !
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Déconnexion
        </button>
      </header>
      <main>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Ceci est votre tableau de bord Dinarus Pro.</p>
        </div>
      </main>
    </div>
  );
}
