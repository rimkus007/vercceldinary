import { useState, useEffect } from 'react';

interface ReferralReward {
  id: string;
  type: string;
  targetType: 'USER' | 'MERCHANT';
  yourReward: number;
  friendReward: number;
  requiredAction: string;
  description: string;
}

interface UseReferralRulesReturn {
  merchantToUserReward: number;
  merchantToMerchantReward: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useReferralRules(userRole: 'USER' | 'MERCHANT' = 'MERCHANT'): UseReferralRulesReturn {
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Utilisation du nouvel endpoint public accessible aux USER et MERCHANT
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('access_token_merchant')
        : '';

      void 0;
      void 0;

      if (!token) {
        void 0;
        // Valeurs par défaut si pas de token
        setRewards([]);
        setLoading(false);
        return;
      }

      void 0;
      const response = await fetch(
        `${apiUrl}/referral/rules/${userRole}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      void 0;

      if (!response.ok) {
        const errorText = await response.text();
        void 0;
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      void 0;
      void 0;
      void 0;
      
      setRewards(data.rewards || []);
    } catch (err: any) {
      void 0;
      void 0;
      setError(err.message);
      // Valeurs par défaut en cas d'erreur
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [userRole]);

  // Trouver la récompense pour MERCHANT → USER
  const merchantToUserReward = rewards.find(r => r.targetType === 'USER')?.yourReward || 500;

  // Trouver la récompense pour MERCHANT → MERCHANT
  const merchantToMerchantReward = rewards.find(r => r.targetType === 'MERCHANT')?.yourReward || 1500;

  void 0;

  return {
    merchantToUserReward,
    merchantToMerchantReward,
    loading,
    error,
    refresh: fetchRules,
  };
}

