export interface SystemSettings {
  fees: {
    payment: number; // Pourcentage
    withdrawal: number;
    instantTransfer: number;
    merchantService: number;
  };
  limits: {
    minTransaction: number;
    maxTransaction: number;
    dailyWithdrawal: number;
    monthlyWithdrawal: number;
  };
  features: {
    instantTransfers: boolean;
    merchantQR: boolean;
    referralProgram: boolean;
    virtualShop: boolean;
  };
  securitySettings: {
    maxLoginAttempts: number;
    sessionTimeout: number;
    requireKYC: boolean;
    minimumKYCLevel: number;
  };
  gamification: {
    pointsMultiplier: number;
    referralBonus: number;
    dailyMissionLimit: number;
  };
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: {
    users: ('view' | 'edit' | 'delete')[];
    merchants: ('view' | 'edit' | 'delete')[];
    transactions: ('view' | 'process' | 'cancel')[];
    settings: ('view' | 'edit')[];
    security: ('view' | 'manage')[];
  };
}

export interface AdminAction {
  id: string;
  adminId: string;
  action: string;
  target: {
    type: string;
    id: string;
  };
  changes: Record<string, any>;
  timestamp: string;
  ip: string;
}
