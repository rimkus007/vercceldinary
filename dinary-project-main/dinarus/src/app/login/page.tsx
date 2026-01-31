"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, AtSign } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, isLoading } = useAuth(); // On récupère "user" et "isLoading"
  const router = useRouter();

  // Ce useEffect redirigera l'utilisateur s'il est déjà connecté
  // C'est ce qui causait le comportement non désiré.
  // En le retirant, on peut accéder à la page même en étant connecté.
  /*
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [isLoading, user, router]);
  */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const success = await login(email, password);
    if (!success) {
      setError("La connexion a échoué. Vérifiez vos identifiants.");
      setLoading(false); // Important: arrêter le chargement en cas d'échec
    }
    // Si la connexion réussit, le AuthContext gère la redirection.
    // setLoading(false) n'est pas nécessaire ici car la page va changer.
  };

  // On affiche un écran de chargement uniquement si le contexte est en train de vérifier une session.
  // Cela évite l'affichage bref de la page de login au rechargement.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-gray-50 p-4">
      {/* Éléments décoratifs flottants */}
      <div className="absolute top-10 -left-10 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-20 -right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-10 left-20 w-60 h-60 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-sm">
        <div
          className="text-center mb-8 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Bienvenue sur Dinary
          </h1>
          <p className="text-gray-500 mt-2">
            Connectez-vous à votre portefeuille
          </p>
        </div>

        <div
          className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-gray-200 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                {error}
              </p>
            )}
            <div className="relative">
              <AtSign
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div className="relative">
              <KeyRound
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-purple-300"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Se connecter"}
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600 text-center">
            Vous n'avez pas de compte ?{" "}
            <Link
              href="/register"
              className="text-purple-600 font-medium hover:underline"
            >
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
