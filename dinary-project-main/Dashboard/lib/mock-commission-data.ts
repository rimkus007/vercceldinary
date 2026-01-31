// Mock data pour le système de commission
import {
  Commission,
  CommissionRule,
  CommissionPayout,
  CommissionSummary,
  CommissionReport,
  CommissionType,
  CommissionStatus,
  PayoutStatus,
  PayoutMethod,
  CommissionEarner,
  CommissionActivity,
  CommissionTrend
} from '@/types/commission';

// Données mock pour les commissions
export const mockCommissions: Commission[] = [
  {
    id: 'comm_001',
    transactionId: 'txn_001',
    userId: 'user_001',
    merchantId: 'merchant_001',
    type: 'transaction',
    structure: {
      type: 'percentage',
      value: 2.5,
      minAmount: 1,
      maxAmount: 100
    },
    amount: 500,
    calculatedAmount: 12.5,
    currency: 'EUR',
    status: 'paid',
    createdAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-15T11:00:00Z',
    paidAt: '2024-01-20T09:00:00Z',
    description: 'Transaction commission pour paiement marchand',
    metadata: {
      paymentMethod: 'card',
      region: 'EU'
    }
  },
  {
    id: 'comm_002',
    transactionId: 'txn_002',
    userId: 'user_002',
    type: 'referral',
    structure: {
      type: 'fixed',
      value: 25,
      minAmount: 25,
      maxAmount: 25
    },
    amount: 25,
    calculatedAmount: 25,
    currency: 'EUR',
    status: 'pending',
    createdAt: '2024-01-18T14:22:00Z',
    description: 'Commission de parrainage - nouvel utilisateur',
    metadata: {
      referredUser: 'user_003',
      campaignId: 'ref_campaign_001'
    }
  },
  {
    id: 'comm_003',
    transactionId: 'txn_003',
    userId: 'user_001',
    merchantId: 'merchant_002',
    type: 'merchant_onboarding',
    structure: {
      type: 'tiered',
      tiers: [
        { minAmount: 0, maxAmount: 1000, rate: 50, type: 'fixed' },
        { minAmount: 1000, maxAmount: 5000, rate: 3, type: 'percentage' },
        { minAmount: 5000, rate: 2, type: 'percentage' }
      ]
    },
    amount: 2500,
    calculatedAmount: 75,
    currency: 'EUR',
    status: 'approved',
    createdAt: '2024-01-20T16:45:00Z',
    processedAt: '2024-01-21T10:00:00Z',
    description: 'Commission onboarding marchand - volume qualifié',
    metadata: {
      merchantTier: 'premium',
      onboardingDate: '2024-01-20'
    }
  },
  {
    id: 'comm_004',
    transactionId: 'txn_004',
    userId: 'user_004',
    type: 'affiliate',
    structure: {
      type: 'hybrid',
      fixedPart: 10,
      percentagePart: 1.5,
      minAmount: 10,
      maxAmount: 200
    },
    amount: 800,
    calculatedAmount: 22,
    currency: 'EUR',
    status: 'calculated',
    createdAt: '2024-01-22T09:15:00Z',
    processedAt: '2024-01-22T09:30:00Z',
    description: 'Commission affilié - vente partenaire',
    metadata: {
      partnerCode: 'PARTNER_001',
      productCategory: 'premium'
    }
  },
  {
    id: 'comm_005',
    transactionId: 'txn_005',
    userId: 'user_002',
    type: 'performance',
    structure: {
      type: 'percentage',
      value: 5,
      minAmount: 50,
      maxAmount: 500
    },
    amount: 1200,
    calculatedAmount: 60,
    currency: 'EUR',
    status: 'pending',
    createdAt: '2024-01-23T11:30:00Z',
    description: 'Bonus performance mensuel',
    metadata: {
      performancePeriod: '2024-01',
      targetAchieved: 120
    }
  }
];

// Données mock pour les règles de commission
export const mockCommissionRules: CommissionRule[] = [
  {
    id: 'rule_001',
    name: 'Commission Transaction Standard',
    description: 'Commission de 2.5% sur toutes les transactions de paiement',
    type: 'transaction',
    structure: {
      type: 'percentage',
      value: 2.5,
      minAmount: 1,
      maxAmount: 100
    },
    isActive: true,
    priority: 1,
    conditions: [
      { field: 'transaction.type', operator: 'equals', value: 'payment' },
      { field: 'transaction.amount', operator: 'greater_than', value: 10 }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin_001'
  },
  {
    id: 'rule_002',
    name: 'Commission Parrainage',
    description: 'Commission fixe de 25€ pour chaque parrainage réussi',
    type: 'referral',
    structure: {
      type: 'fixed',
      value: 25,
      minAmount: 25,
      maxAmount: 25
    },
    isActive: true,
    priority: 2,
    conditions: [
      { field: 'referral.status', operator: 'equals', value: 'completed' },
      { field: 'referred_user.verified', operator: 'equals', value: true }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z',
    createdBy: 'admin_001'
  },
  {
    id: 'rule_003',
    name: 'Commission Onboarding Marchand',
    description: 'Commission progressive selon le volume du marchand',
    type: 'merchant_onboarding',
    structure: {
      type: 'tiered',
      tiers: [
        { minAmount: 0, maxAmount: 1000, rate: 50, type: 'fixed' },
        { minAmount: 1000, maxAmount: 5000, rate: 3, type: 'percentage' },
        { minAmount: 5000, rate: 2, type: 'percentage' }
      ]
    },
    isActive: true,
    priority: 3,
    conditions: [
      { field: 'merchant.status', operator: 'equals', value: 'active' },
      { field: 'merchant.volume_30d', operator: 'greater_than', value: 500 }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
    createdBy: 'admin_002'
  }
];

// Données mock pour les payouts
export const mockPayouts: CommissionPayout[] = [
  {
    id: 'payout_001',
    userId: 'user_001',
    commissionIds: ['comm_001'],
    totalAmount: 12.5,
    currency: 'EUR',
    method: 'bank_transfer',
    status: 'completed',
    scheduledDate: '2024-01-20T09:00:00Z',
    processedDate: '2024-01-20T09:30:00Z',
    reference: 'BNKTRF_001',
    fees: 0.5,
    netAmount: 12,
    metadata: {
      bankAccount: '****1234',
      transferId: 'TRF_001'
    }
  },
  {
    id: 'payout_002',
    userId: 'user_002',
    commissionIds: ['comm_002', 'comm_005'],
    totalAmount: 85,
    currency: 'EUR',
    method: 'paypal',
    status: 'processing',
    scheduledDate: '2024-01-25T10:00:00Z',
    fees: 2.55,
    netAmount: 82.45,
    metadata: {
      paypalEmail: 'user2@example.com'
    }
  },
  {
    id: 'payout_003',
    userId: 'user_001',
    commissionIds: ['comm_003'],
    totalAmount: 75,
    currency: 'EUR',
    method: 'internal_wallet',
    status: 'scheduled',
    scheduledDate: '2024-01-28T12:00:00Z',
    fees: 0,
    netAmount: 75,
    metadata: {
      walletId: 'wallet_001'
    }
  }
];

// Données mock pour le résumé des commissions
export const mockCommissionSummary: CommissionSummary = {
  totalCommissions: 5,
  pendingCommissions: 2,
  paidCommissions: 1,
  totalAmount: 194.5,
  pendingAmount: 85,
  paidAmount: 12.5,
  averageCommission: 38.9,
  topEarners: [
    {
      userId: 'user_001',
      userName: 'Jean Dupont',
      totalEarned: 87.5,
      commissionsCount: 2,
      averageCommission: 43.75
    },
    {
      userId: 'user_002',
      userName: 'Marie Martin',
      totalEarned: 85,
      commissionsCount: 2,
      averageCommission: 42.5
    },
    {
      userId: 'user_004',
      userName: 'Pierre Bernard',
      totalEarned: 22,
      commissionsCount: 1,
      averageCommission: 22
    }
  ],
  recentActivity: [
    {
      id: 'activity_001',
      type: 'commission_earned',
      description: 'Commission performance calculée',
      amount: 60,
      userId: 'user_002',
      createdAt: '2024-01-23T11:30:00Z'
    },
    {
      id: 'activity_002',
      type: 'commission_paid',
      description: 'Paiement commission transaction',
      amount: 12.5,
      userId: 'user_001',
      createdAt: '2024-01-20T09:30:00Z'
    },
    {
      id: 'activity_003',
      type: 'rule_updated',
      description: 'Règle onboarding marchand mise à jour',
      createdAt: '2024-01-20T16:00:00Z'
    }
  ]
};

// Données mock pour les rapports
export const mockCommissionReport: CommissionReport = {
  period: '2024-01',
  totalCommissions: 5,
  totalAmount: 194.5,
  byType: {
    transaction: { count: 1, amount: 12.5 },
    referral: { count: 1, amount: 25 },
    merchant_onboarding: { count: 1, amount: 75 },
    affiliate: { count: 1, amount: 22 },
    performance: { count: 1, amount: 60 },
    user_registration: { count: 0, amount: 0 },
    subscription: { count: 0, amount: 0 },
    bonus: { count: 0, amount: 0 },
    custom: { count: 0, amount: 0 }
  },
  byStatus: {
    pending: { count: 2, amount: 85 },
    calculated: { count: 1, amount: 22 },
    approved: { count: 1, amount: 75 },
    paid: { count: 1, amount: 12.5 },
    cancelled: { count: 0, amount: 0 },
    disputed: { count: 0, amount: 0 },
    expired: { count: 0, amount: 0 }
  },
  topEarners: [
    {
      userId: 'user_001',
      userName: 'Jean Dupont',
      totalEarned: 87.5,
      commissionsCount: 2,
      averageCommission: 43.75
    },
    {
      userId: 'user_002',
      userName: 'Marie Martin',
      totalEarned: 85,
      commissionsCount: 2,
      averageCommission: 42.5
    }
  ],
  trends: [
    { date: '2024-01-15', commissionsCount: 1, totalAmount: 12.5, averageAmount: 12.5 },
    { date: '2024-01-18', commissionsCount: 1, totalAmount: 25, averageAmount: 25 },
    { date: '2024-01-20', commissionsCount: 1, totalAmount: 75, averageAmount: 75 },
    { date: '2024-01-22', commissionsCount: 1, totalAmount: 22, averageAmount: 22 },
    { date: '2024-01-23', commissionsCount: 1, totalAmount: 60, averageAmount: 60 }
  ]
};

// Fonction helper pour simuler des délais réseau
export const simulateNetworkDelay = (ms: number = 800): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Fonction pour générer des données supplémentaires si nécessaire
export const generateMockCommission = (overrides: Partial<Commission> = {}): Commission => {
  const baseCommission: Commission = {
    id: `comm_${Date.now()}`,
    transactionId: `txn_${Date.now()}`,
    userId: `user_${Math.floor(Math.random() * 1000)}`,
    type: 'transaction',
    structure: {
      type: 'percentage',
      value: 2.5,
      minAmount: 1,
      maxAmount: 100
    },
    amount: Math.floor(Math.random() * 1000) + 100,
    calculatedAmount: 0,
    currency: 'EUR',
    status: 'pending',
    createdAt: new Date().toISOString(),
    description: 'Commission générée automatiquement'
  };

  baseCommission.calculatedAmount = Math.min(
    Math.max(
      baseCommission.amount * (baseCommission.structure.value || 0) / 100,
      baseCommission.structure.minAmount || 0
    ),
    baseCommission.structure.maxAmount || Infinity
  );

  return { ...baseCommission, ...overrides };
};
