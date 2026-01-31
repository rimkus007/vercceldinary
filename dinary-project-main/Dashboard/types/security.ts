export interface Report {
  id: string;
  type: 'fraud' | 'scam' | 'inappropriate' | 'other';
  reporterId: string;
  targetId: string;
  targetType: 'user' | 'merchant' | 'transaction';
  description: string;
  evidence?: string[]; // URLs des preuves
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  resolution?: {
    action: 'blocked' | 'warning' | 'none';
    note: string;
    adminId: string;
    timestamp: string;
  };
}

export interface SecurityLog {
  id: string;
  type: 'login' | 'transaction' | 'modification' | 'report';
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface BlacklistEntry {
  id: string;
  type: 'phone' | 'email' | 'ip' | 'device' | 'name';
  value: string;
  reason: string;
  addedBy: string;
  addedAt: string;
  expiresAt?: string;
  notes?: string;
}
