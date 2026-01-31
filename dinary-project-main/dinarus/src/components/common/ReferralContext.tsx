// components/common/ReferralContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
// Le type de 'useNotifications' a été corrigé dans les étapes précédentes.
// Si vous avez une erreur ici, assurez-vous que le contexte exporte bien 'addNotification'.
// import { useNotifications } from "./NotificationsContext";
import { useAuth } from "@/context/AuthContext";

// 👇 ÉTAPE 1 : Mettre à jour l'interface pour inclure le statut dynamique
interface ReferralUser {
  id: string;
  name: string;
  date: number; // timestamp
  status: "completed" | "pending"; // On accepte maintenant les deux statuts
}

interface ReferralStats {
  totalEarned: number;
  pendingRewards: number;
  totalInvited: number;
  referralCode: string;
}

interface ReferralContextType {
  referrals: ReferralUser[];
  stats: ReferralStats;
  referralLink: string;
  copyReferralLink: () => Promise<boolean>;
  shareReferralLink: () => Promise<boolean>;
}

const ReferralContext = createContext<ReferralContextType | undefined>(
  undefined
);

export const useReferral = () => {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    throw new Error(
      "useReferral doit être utilisé à l'intérieur d'un ReferralProvider"
    );
  }
  return context;
};

export const ReferralProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalEarned: 0,
    pendingRewards: 0,
    totalInvited: 0,
    referralCode: "CHARGEMENT...",
  });

  // const { addNotification } = useNotifications(); // Décommentez si nécessaire
  const { token } = useAuth();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = `${baseUrl}/register?referralCode=${stats.referralCode}`;

  useEffect(() => {
    const fetchReferralData = async () => {
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/me/referral-details`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!response.ok) {
            throw new Error("Impossible de charger les données de parrainage.");
          }

          const data = await response.json();

          // 👇 ÉTAPE 2 : LA CORRECTION PRINCIPALE EST ICI 👇
          // On supprime la transformation .map() car le backend envoie déjà les données formatées.
          setReferrals(data.referrals || []);

          setStats((prev) => ({
            ...prev,
            referralCode: data.referralCode || "NON-DISPONIBLE",
            totalInvited: data.referrals ? data.referrals.length : 0,
            totalEarned: data.totalEarned,
          }));
        } catch (error) {
          void 0;
          setStats((prev) => ({
            ...prev,
            referralCode: "ERREUR",
          }));
        }
      }
    };

    fetchReferralData();
  }, [token]);

  const copyReferralLink = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(referralLink);
      // addNotification({ title: "Lien copié !", message: "Le lien de parrainage a été copié.", type: "system" });
      return true;
    } catch (error) {
      void 0;
      return false;
    }
  };

  const shareReferralLink = async (): Promise<boolean> => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Rejoignez-moi sur Dinary!",
          text: `Utilise mon code de parrainage pour un bonus : ${stats.referralCode}`,
          url: referralLink,
        });
        return true;
      } else {
        return await copyReferralLink();
      }
    } catch (error) {
      void 0;
      return false;
    }
  };

  const value: ReferralContextType = {
    referrals,
    stats,
    referralLink,
    copyReferralLink,
    shareReferralLink,
  };

  return (
    <ReferralContext.Provider value={value}>
      {children}
    </ReferralContext.Provider>
  );
};
