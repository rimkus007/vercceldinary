"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { API_URL } from "@/lib/api";

// --- Interfaces ---
interface User {
  id: string;
  email: string;
  role: "ADMIN";
  fullName: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  logout: () => void;
  // La fonction login n'a pas besoin de retourner une promesse ici
  login: (email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_STORAGE_KEY = "dinary_admin_access_token";

// --- Le Provider d'Authentification ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Reste à true par défaut
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem("admin_user");
    setToken(null);
    setUser(null);
    // Redirection vers la page de login de l'application principale
    window.location.href = "http://localhost:3000/login";
  }, []);

  useEffect(() => {
    const verifyAuth = async () => {
      let currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const tokenFromUrl = searchParams.get("token");

      if (tokenFromUrl) {
        currentToken = tokenFromUrl;
        localStorage.setItem(TOKEN_STORAGE_KEY, tokenFromUrl);
        // Ne pas faire de replace immédiatement, on laisse le token dans l'URL
        // et on va le nettoyer après la vérification
      }

      if (currentToken) {
        try {
          // Validation complète côté serveur (la méthode la plus fiable)
          const response = await fetch(
            `${API_URL}/users/me`,
            {
              headers: { Authorization: `Bearer ${currentToken}` },
            }
          );

          if (!response.ok) {
            throw new Error("Token invalide ou session révoquée.");
          }

          const userData: User = await response.json();
          if (userData.role !== "ADMIN") {
            throw new Error("Accès refusé. Rôle non administrateur.");
          }

          setToken(currentToken);
          setUser(userData);
          localStorage.setItem("admin_user", JSON.stringify(userData));
          
          // Nettoyer l'URL si on vient d'un login avec token
          if (tokenFromUrl) {
            router.replace(pathname, { scroll: false });
          }
        } catch (error) {
          // Ne déconnecter que sur les erreurs d'authentification (401, 403)
          if (error instanceof Error && error.message.includes('401') || error.message.includes('403') || error.message.includes('Token') || error.message.includes('session révoquée')) {
            logout();
          } else {
            // Pour les autres erreurs (réseau, serveur, etc.), on ne déconnecte pas
            console.warn('Erreur de vérification d\'auth (pas de déconnexion):', error);
          }
        }
      } else {
        // Pas de token du tout, on ne fait rien, les pages protégées redirigeront
      }

      setIsLoading(false);
    };

    verifyAuth();
  }, [searchParams, router, pathname, logout]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Identifiants invalides");
      }

      const { access_token } = await response.json();
      localStorage.setItem(TOKEN_STORAGE_KEY, access_token);

      // On récupère les infos de l'utilisateur après le login réussi
      const userRes = await fetch(
        `${API_URL}/users/me`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      const userData = await userRes.json();

      setUser(userData);
      setToken(access_token);
      localStorage.setItem("admin_user", JSON.stringify(userData));

      router.push("/admin/dashboard");
      return true;
    } catch (error) {
      
      return false;
    }
  };

  // Affiche un écran de chargement global pendant la vérification initiale
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dinary-turquoise"></div>
      </div>
    );
  }

  // Si le chargement est terminé et qu'il n'y a pas d'utilisateur
  // Redirection vers le login général de l'application principale
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "http://localhost:3000/login";
    }
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <p>Redirection vers la page de connexion...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, logout, login, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};
