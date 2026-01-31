import { SecurityLog, Report, BlacklistEntry } from '@/types/security';
import { mockSecurityData } from './mock-security-data';

// En mode développement, on utilise des données simulées
const USE_MOCK_DATA = true;

// Fonctions du service
export async function fetchSecurityLogs(period: string = '24h'): Promise<SecurityLog[]> {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const now = Date.now();
  const timeAgo = period === '7d' ? 7 * 24 * 3600000 :
                 period === '30d' ? 30 * 24 * 3600000 :
                 period === 'all' ? Infinity :
                 24 * 3600000;

  return mockSecurityData.logs.filter(log => 
    new Date(log.timestamp).getTime() > now - timeAgo
  );
}

export async function fetchSecurityReports(period: string = '24h'): Promise<Report[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const now = Date.now();
  const timeAgo = period === '7d' ? 7 * 24 * 3600000 :
                 period === '30d' ? 30 * 24 * 3600000 :
                 period === 'all' ? Infinity :
                 24 * 3600000;

  return mockSecurityData.reports.filter(report => 
    new Date(report.createdAt).getTime() > now - timeAgo
  );
}

export async function fetchBlacklist(): Promise<BlacklistEntry[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockSecurityData.blacklist;
}

export async function resolveReport(
  reportId: string,
  resolution: Report['resolution']
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 800));
  const reportIndex = mockSecurityData.reports.findIndex(r => r.id === reportId);
  if (reportIndex !== -1) {
    mockSecurityData.reports[reportIndex] = {
      ...mockSecurityData.reports[reportIndex],
      status: 'resolved',
      resolution,
      updatedAt: new Date().toISOString()
    };
  }
}

export async function addToBlacklist(
  entry: Omit<BlacklistEntry, 'id'>
): Promise<BlacklistEntry> {
  await new Promise(resolve => setTimeout(resolve, 800));
  const newEntry = {
    ...entry,
    id: String(mockSecurityData.blacklist.length + 1)
  };
  mockSecurityData.blacklist.push(newEntry);
  return newEntry;
}

export async function removeFromBlacklist(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 800));
  const index = mockSecurityData.blacklist.findIndex(entry => entry.id === id);
  if (index !== -1) {
    mockSecurityData.blacklist.splice(index, 1);
  }
}

export async function deleteReport(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 800));
  const index = mockSecurityData.reports.findIndex(report => report.id === id);
  if (index !== -1) {
    mockSecurityData.reports.splice(index, 1);
  }
}