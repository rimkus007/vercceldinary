export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'one-time' | 'special';
  reward: {
    type: 'points' | 'boosts' | 'cash' | 'badge';
    amount: number;
  };
  conditions: {
    type: 'transaction_count' | 'transaction_amount' | 'referral_count' | 'login_streak' | 'custom';
    target: number;
    currentProgress?: number;
  };
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'expired';
  participants: number;
  completions: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  conditions: {
    type: string;
    value: number;
  }[];
  rarity: number; // Pourcentage des utilisateurs ayant ce badge
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'virtual' | 'physical' | 'discount' | 'boost';
  cost: number;
  costType: 'points' | 'boosts';
  stock: number;
  image?: string;
  expiresAt?: string;
  restrictions?: {
    userType?: string[];
    maxPerUser?: number;
    minLevel?: number;
  };
}
