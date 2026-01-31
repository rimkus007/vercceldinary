'use client'

import { useState } from 'react';
import { 
  Shield, User, CreditCard, AlertTriangle, 
  Eye, Clock, MapPin, Calendar,
  ChevronDown, Filter, Search
} from 'lucide-react';

interface AdminAction {
  id: string;
  timestamp: string;
  adminName: string;
  adminId: string;
  action: string;
  target: string;
  targetId: string;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failed' | 'pending';
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Mock data
const mockActions: AdminAction[] = [
  {
    id: '1',
    timestamp: '2025-06-02T10:30:00Z',
    adminName: 'Ahmed Benali',
    adminId: 'admin_001',
    action: 'Gel de compte utilisateur',
    target: 'User',
    targetId: 'user_12345',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    result: 'success',
    details: 'Compte gelé pour activité suspecte - 15 transactions identiques',
    severity: 'high'
  },
  {
    id: '2',
    timestamp: '2025-06-02T09:15:00Z',
    adminName: 'Fatima Kadi',
    adminId: 'admin_002',
    action: 'Validation KYC commerçant',
    target: 'Merchant',
    targetId: 'merchant_789',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    result: 'success',
    details: 'Documents vérifiés et approuvés - Restaurant "Le Gourmet"',
    severity: 'medium'
  },
  {
    id: '3',
    timestamp: '2025-06-02T08:45:00Z',
    adminName: 'Omar Meziane',
    adminId: 'admin_003',
    action: 'Déblocage de paiement',
    target: 'Transaction',
    targetId: 'tx_456789',
    ipAddress: '192.168.1.110',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    result: 'success',
    details: 'Paiement de 15,000 DA débloqué après vérification',
    severity: 'medium'
  },
  {
    id: '4',
    timestamp: '2025-06-02T07:20:00Z',
    adminName: 'Amina Bousaid',
    adminId: 'admin_004',
    action: 'Création utilisateur admin',
    target: 'Admin',
    targetId: 'admin_005',
    ipAddress: '192.168.1.115',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    result: 'success',
    details: 'Nouvel administrateur ajouté - Rôle: Modérateur',
    severity: 'critical'
  },
  {
    id: '5',
    timestamp: '2025-06-01T16:30:00Z',
    adminName: 'Karim Boudjemaa',
    adminId: 'admin_006',
    action: 'Modification limite transaction',
    target: 'System',
    targetId: 'config_limits',
    ipAddress: '192.168.1.120',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    result: 'success',
    details: 'Limite quotidienne augmentée à 50,000 DA',
    severity: 'high'
  }
];

export default function HistoriqueActionsAdmin() {
  const [actions] = useState<AdminAction[]>(mockActions);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Gel') || action.includes('Blocage')) {
      return <Shield className="w-4 h-4" />;
    } else if (action.includes('utilisateur') || action.includes('admin')) {
      return <User className="w-4 h-4" />;
    } else if (action.includes('paiement') || action.includes('transaction')) {
      return <CreditCard className="w-4 h-4" />;
    } else {
      return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredActions = actions.filter(action => {
    const matchesSeverity = selectedSeverity === 'all' || action.severity === selectedSeverity;
    const matchesSearch = action.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Historique des Actions Admin</h3>
            <p className="text-sm text-gray-500">Journal des actions critiques des administrateurs</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
          {filteredActions.length} actions
        </span>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une action, admin ou détails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">Toutes les sévérités</option>
            <option value="critical">Critique</option>
            <option value="high">Élevée</option>
            <option value="medium">Moyenne</option>
            <option value="low">Faible</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* Liste des actions */}
      <div className="space-y-3">
        {filteredActions.map((action) => (
          <div key={action.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                  {getActionIcon(action.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800 truncate">{action.action}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(action.severity)}`}>
                      {action.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultColor(action.result)}`}>
                      {action.result}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {action.adminName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(action.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {action.ipAddress}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{action.details}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(showDetails === action.id ? null : action.id)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Détails étendus */}
            {showDetails === action.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">ID Admin:</span>
                    <span className="ml-2 text-gray-800">{action.adminId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Cible:</span>
                    <span className="ml-2 text-gray-800">{action.target} ({action.targetId})</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600">User Agent:</span>
                    <span className="ml-2 text-gray-800 break-all">{action.userAgent}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredActions.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune action trouvée avec les filtres actuels</p>
        </div>
      )}
    </div>
  );
}
