// Types pour le système de gestion des commissions

export interface Commission {
  id: string;
  transactionId: string;
  userId: string;
  merchantId?: string;
  type: CommissionType;
  structure: CommissionStructure;
  amount: number;
  calculatedAmount: number;
  currency: string;
  status: CommissionStatus;
  createdAt: string;
  processedAt?: string;
  paidAt?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface CommissionRule {
  id: string;
  name: string;
  description: string;
  type: CommissionType;
  structure: CommissionStructure;
  isActive: boolean;
  priority: number;
  conditions: CommissionCondition[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CommissionStructure {
  type: 'fixed' | 'percentage' | 'tiered' | 'hybrid';
  value?: number; // Pour fixed et percentage
  tiers?: CommissionTier[]; // Pour tiered
  fixedPart?: number; // Pour hybrid
  percentagePart?: number; // Pour hybrid
  minAmount?: number;
  maxAmount?: number;
}

export interface CommissionTier {
  minAmount: number;
  maxAmount?: number;
  rate: number;
  type: 'fixed' | 'percentage';
}

export interface CommissionCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
}

export interface CommissionPayout {
  id: string;
  userId: string;
  commissionIds: string[];
  totalAmount: number;
  currency: string;
  method: PayoutMethod;
  status: PayoutStatus;
  scheduledDate: string;
  processedDate?: string;
  reference?: string;
  fees?: number;
  netAmount: number;
  metadata?: Record<string, any>;
}

export interface CommissionSummary {
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  averageCommission: number;
  topEarners: CommissionEarner[];
  recentActivity: CommissionActivity[];
}

export interface CommissionEarner {
  userId: string;
  userName: string;
  totalEarned: number;
  commissionsCount: number;
  averageCommission: number;
}

export interface CommissionActivity {
  id: string;
  type: 'commission_earned' | 'commission_paid' | 'rule_created' | 'rule_updated';
  description: string;
  amount?: number;
  userId?: string;
  createdAt: string;
}

export interface CommissionReport {
  period: string;
  totalCommissions: number;
  totalAmount: number;
  byType: Record<CommissionType, { count: number; amount: number }>;
  byStatus: Record<CommissionStatus, { count: number; amount: number }>;
  topEarners: CommissionEarner[];
  trends: CommissionTrend[];
}

export interface CommissionTrend {
  date: string;
  commissionsCount: number;
  totalAmount: number;
  averageAmount: number;
}

export type CommissionType =
  | 'transaction'
  | 'send_money'
  | 'referral'
  | 'merchant_onboarding'
  | 'user_registration'
  | 'subscription'
  | 'affiliate'
  | 'performance'
  | 'bonus'
  | 'custom';
  | 'send_money';

export type CommissionStatus = 
  | 'pending'
  | 'calculated'
  | 'approved'
  | 'paid'
  | 'cancelled'
  | 'disputed'
  | 'expired';

export type PayoutMethod = 
  | 'bank_transfer'
  | 'paypal'
  | 'crypto'
  | 'internal_wallet'
  | 'check'
  | 'mobile_money';

export type PayoutStatus = 
  | 'scheduled'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface CommissionFilters {
  type?: CommissionType[];
  status?: CommissionStatus[];
  userId?: string;
  merchantId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface PayoutFilters {
  status?: PayoutStatus[];
  method?: PayoutMethod[];
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}
