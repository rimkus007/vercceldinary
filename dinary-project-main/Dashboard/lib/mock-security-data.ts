import { SecurityLog, Report, BlacklistEntry } from '@/types/security';

// Données simulées pour le développement
export const mockSecurityData = {
  logs: [
    {
      id: '1',
      type: 'login',
      severity: 'warning',
      userId: 'user123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      details: { reason: 'Multiple failed attempts' },
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      type: 'transaction',
      severity: 'critical',
      userId: 'user456',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0...',
      details: { amount: 5000, suspicious: true },
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '3',
      type: 'modification',
      severity: 'info',
      userId: 'admin789',
      ipAddress: '192.168.1.3',
      userAgent: 'Mozilla/5.0...',
      details: { action: 'settings_update' },
      timestamp: new Date(Date.now() - 10800000).toISOString()
    }
  ] as SecurityLog[],

  reports: [
    {
      id: '1',
      type: 'fraud',
      reporterId: 'user789',
      targetId: 'merchant123',
      targetType: 'merchant',
      description: 'Suspicious activity detected with high transaction volume',
      status: 'pending',
      priority: 'high',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '2',
      type: 'scam',
      reporterId: 'user101',
      targetId: 'user456',
      targetType: 'user',
      description: 'User reported for phishing attempts',
      status: 'investigating',
      priority: 'medium',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ] as Report[],

  blacklist: [
    {
      id: '1',
      type: 'ip',
      value: '10.0.0.1',
      reason: 'Multiple fraud attempts',
      addedBy: 'admin123',
      addedAt: new Date(Date.now() - 604800000).toISOString(),
      notes: 'Blocked after 5 suspicious transactions'
    },
    {
      id: '2',
      type: 'email',
      value: 'suspicious@example.com',
      reason: 'Spam activities',
      addedBy: 'admin456',
      addedAt: new Date(Date.now() - 1209600000).toISOString(),
      expiresAt: new Date(Date.now() + 2592000000).toISOString()
    }
  ] as BlacklistEntry[]
};
