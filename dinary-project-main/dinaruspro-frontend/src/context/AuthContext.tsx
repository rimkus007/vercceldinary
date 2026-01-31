// Fichier : app/context/AuthContext.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

// --- Interfaces pour les données du vendeur ---
interface User {
  id: string;
  email: string;
  role: "MERCHANT";
  fullName: string;
  username: string;
  verificationStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
}

interface MerchantProfile {
  id: string;
  name: string;
  category: string;
  address: string;
  description: string;
  latitude?: number;
  longitude?: number;
  products?: any[]; // Vous pouvez créer une interface Produit plus tard
}

interface AuthContextType {
  user: User | null;
  merchantProfile: MerchantProfile | null;
  token: string | null;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clé de stockage unique pour le token du vendeur
const TOKEN_STORAGE_KEY = "access_token_merchant";
// URL de la page de connexion centrale (app Dinarus grand public)
const CENTRAL_LOGIN_URL =
  process.env.NEXT_PUBLIC_CENTRAL_LOGIN_URL || "http://localhost:3000/login"; // Adaptez si nécessaire

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [merchantProfile, setMerchantProfile] =
    useState<MerchantProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const didInit = useRef(false);

  const fetchMerchantData = useCallback(async (currentToken: string) => {
    try {
      // On lance les deux appels en parallèle pour plus de rapidité
      const [userRes, merchantRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchants/me`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        }),
      ]);

      if (!userRes.ok || !merchantRes.ok) {
        throw new Error("Impossible de récupérer les données du marchand.");
      }

      const userData = await userRes.json();

      // On s'assure que l'utilisateur est bien un vendeur
      if (userData.role !== "MERCHANT") {
        throw new Error("Accès réservé aux vendeurs.");
      }

      setUser(userData);
      setMerchantProfile(await merchantRes.json());
      setToken(currentToken);
    } catch (error) {
      void 0;
      // En cas d'erreur, on déconnecte l'utilisateur
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.location.href = CENTRAL_LOGIN_URL;
    }
  }, []);

  useEffect(() => {
    // Ce code s'exécute une seule fois au chargement de l'application
    if (didInit.current) return;
    didInit.current = true;

    const tokenFromUrl = searchParams.get("token");
    let sessionToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (tokenFromUrl) {
      // 1. Si un token est dans l'URL, on le sauvegarde et on nettoie l'URL
      sessionToken = tokenFromUrl;
      localStorage.setItem(TOKEN_STORAGE_KEY, tokenFromUrl);
      router.replace("/dashboard"); // Redirige vers la même page mais sans le token dans l'URL
    }

    if (sessionToken) {
      // 2. Si un token existe, on récupère les données du vendeur
      fetchMerchantData(sessionToken).finally(() => setIsLoading(false));
    } else {
      // 3. Si aucun token n'est trouvé, on redirige vers la page de connexion
      window.location.href = CENTRAL_LOGIN_URL;
    }
  }, [searchParams, router, fetchMerchantData]);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (currentToken) {
      await fetchMerchantData(currentToken);
    }
  }, [fetchMerchantData]);

  const logout = () => {
    setUser(null);
    setMerchantProfile(null);
    setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.location.href = CENTRAL_LOGIN_URL;
  };

  const value = {
    user,
    merchantProfile,
    token,
    logout,
    isLoading,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }
  return context;
};
