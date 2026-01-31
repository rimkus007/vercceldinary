// app/context/AuthContext.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

// --- Interfaces ---
interface User {
  id: string;
  email: string;
  role: "ADMIN" | "MERCHANT" | "USER";
  fullName: string;
  username: string;
  verificationStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
}
interface Wallet {
  balance: number;
}
interface GamificationProfile {
  level: number;
  xp: number;
  xpToNextLevel: number;
}
interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  gamificationProfile: GamificationProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = "access_token_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [gamificationProfile, setGamificationProfile] =
    useState<GamificationProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchData = useCallback(
    async (currentToken: string) => {
      // ... (cette fonction ne change pas)
      try {
        const [userRes, walletRes, gamificationRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${currentToken}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/me`, {
            headers: { Authorization: `Bearer ${currentToken}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/gamification/profile`, {
            headers: { Authorization: `Bearer ${currentToken}` },
          }),
        ]);

        if (!userRes.ok || !walletRes.ok || !gamificationRes.ok) {
          throw new Error("Erreur de récupération des données.");
        }

        setUser(await userRes.json());
        setWallet(await walletRes.json());
        setGamificationProfile(await gamificationRes.json());
      } catch (error) {
        void 0;
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken) {
      setToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchData(token);
    }
  }, [token, fetchData]);

  const refreshUser = useCallback(() => {
    if (token) {
      fetchData(token);
    }
  }, [token, fetchData]);

  // --- CORRECTION MAJEURE : Restauration de la logique de redirection ---
  const login = async (email, password) => {
    try {
      const loginResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!loginResponse.ok) {
        throw new Error("Email ou mot de passe incorrect.");
      }

      const { access_token } = await loginResponse.json();

      if (access_token) {
        // On doit d'abord décoder le token ou demander au backend le rôle
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );

        if (!userResponse.ok) {
          throw new Error(
            "Impossible de récupérer les informations de l'utilisateur."
          );
        }

        const userData: User = await userResponse.json();

        // C'est cette logique qui manquait
        switch (userData.role) {
          case "ADMIN":
            // On redirige vers le tableau de bord admin avec le token
            window.location.href = `http://localhost:3002/admin/dashboard?token=${access_token}`;
            break;
          case "MERCHANT":
            // On redirige vers le tableau de bord vendeur avec le token
            window.location.href = `http://localhost:3003/dashboard?token=${access_token}`;
            break;
          case "USER":
            // Pour un utilisateur normal, on stocke le token et on continue sur le site client
            localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
            setToken(access_token);
            router.push("/dashboard");
            break;
          default:
            throw new Error("Rôle utilisateur non reconnu.");
        }
        return true;
      }
      return false;
    } catch (error) {
      void 0;
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setWallet(null);
    setGamificationProfile(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        gamificationProfile,
        token,
        login,
        logout,
        isLoading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
