'use client';

import { useState } from 'react';
import { 
  Clock, 
  CreditCard, 
  Wallet, 
  Store, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ArrowRight,
  RefreshCw,
  Filter,
  Bell
} from 'lucide-react';

interface PendingRequest {
  id: string;
  type: 'recharge' | 'withdrawal' | 'merchant_kyc' | 'fraud_report';
  title: string;
  description: string;
  amount?: number;
  userId: string;
  userName: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'review' | 'urgent';
}

const mockPendingRequests: PendingRequest[] = [
  {
    id: 'RCH_001',
    type: 'recharge',
    title: 'Demande de recharge',
    description: 'Recharge par virement bancaire - Justificatif fourni',
    amount: 50000,
    userId: 'USR_789',
    userName: 'Ahmed Benaissa',
    timestamp: '2025-06-02T10:30:00Z',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 'WTH_002',
    type: 'withdrawal',
    title: 'Demande de retrait',
    description: 'Retrait vers compte bancaire CCP',
    amount: 25000,
    userId: 'USR_456',
    userName: 'Fatima Meziane',
    timestamp: '2025-06-02T09:45:00Z',
    priority: 'medium',
    status: 'pending'
  },
  {
    id: 'KYC_003',
    type: 'merchant_kyc',
    title: 'Vérification commerçant',
    description: 'Documents KYC soumis - Café "Zawiya"',
    userId: 'MER_123',
    userName: 'Karim Boutique',
    timestamp: '2025-06-02T08:20:00Z',
    priority: 'medium',
    status: 'review'
  },
  {
    id: 'FRD_004',
    type: 'fraud_report',
    title: 'Signalement de fraude',
    description: 'Transaction suspecte rapportée par utilisateur',
    amount: 15000,
    userId: 'USR_321',
    userName: 'Yacine Boulahbal',
    timestamp: '2025-06-02T07:15:00Z',
    priority: 'high',
    status: 'urgent'
  },
  {
    id: 'RCH_005',
    type: 'recharge',
    title: 'Recharge en attente',
    description: 'Vérification manuelle requise - Montant élevé',
    amount: 100000,
    userId: 'USR_567',
    userName: 'Mounir Taleb',
    timestamp: '2025-06-01T16:30:00Z',
    priority: 'high',
    status: 'review'
  },
  {
    id: 'WTH_006',
    type: 'withdrawal',
    title: 'Retrait bloqué',
    description: 'Limite quotidienne dépassée',
    amount: 75000,
    userId: 'USR_890',
    userName: 'Salima Cherif',
    timestamp: '2025-06-01T14:20:00Z',
    priority: 'low',
    status: 'pending'
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'recharge':
      return <CreditCard className="w-5 h-5 text-green-600" />;
    case 'withdrawal':
      return <Wallet className="w-5 h-5 text-blue-600" />;
    case 'merchant_kyc':
      return <Store className="w-5 h-5 text-purple-600" />;
    case 'fraud_report':
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    default:
      return <Clock className="w-5 h-5 text-gray-600" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'recharge':
      return 'Recharge';
    case 'withdrawal':
      return 'Retrait';
    case 'merchant_kyc':
      return 'KYC Commerçant';
    case 'fraud_report':
      return 'Signalement';
    default:
      return 'Demande';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'low':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'urgent':
      return 'border-red-400 bg-red-50';
    case 'review':
      return 'border-yellow-400 bg-yellow-50';
    case 'pending':
      return 'border-gray-300 bg-white';
    default:
      return 'border-gray-300 bg-white';
  }
};

export default function DemandesEnAttente() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [requests, setRequests] = useState(mockPendingRequests);

  const filteredRequests = selectedType 
    ? requests.filter(req => req.type === selectedType)
    : requests;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes}min`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `Il y a ${diffInHours}h`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `Il y a ${diffInDays}j`;
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRequestCounts = () => {
    return {
      recharge: requests.filter(r => r.type === 'recharge').length,
      withdrawal: requests.filter(r => r.type === 'withdrawal').length,
      merchant_kyc: requests.filter(r => r.type === 'merchant_kyc').length,
      fraud_report: requests.filter(r => r.type === 'fraud_report').length,
      urgent: requests.filter(r => r.status === 'urgent').length
    };
  };

  const counts = getRequestCounts();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Demandes en Attente</h3>
            <p className="text-sm text-gray-500">Actions requises par l'administration</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {counts.urgent > 0 && (
            <span className="flex items-center space-x-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm">
              <Bell className="w-4 h-4" />
              <span>{counts.urgent} urgent{counts.urgent > 1 ? 's' : ''}</span>
            </span>
          )}
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filtres par type */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedType(null)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedType === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>Tout ({requests.length})</span>
        </button>
        
        {[
          { key: 'recharge', label: 'Recharges', count: counts.recharge, icon: CreditCard },
          { key: 'withdrawal', label: 'Retraits', count: counts.withdrawal, icon: Wallet },
          { key: 'merchant_kyc', label: 'KYC', count: counts.merchant_kyc, icon: Store },
          { key: 'fraud_report', label: 'Fraudes', count: counts.fraud_report, icon: AlertTriangle }
        ].map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedType(key)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedType === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label} ({count})</span>
          </button>
        ))}
      </div>

      {/* Liste des demandes */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucune demande en attente</p>
          </div>
        ) : (
          filteredRequests
            .sort((a, b) => {
              // Trier par priorité puis par timestamp
              const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
              const aPriority = a.status === 'urgent' ? 0 : priorityOrder[a.priority as keyof typeof priorityOrder];
              const bPriority = b.status === 'urgent' ? 0 : priorityOrder[b.priority as keyof typeof priorityOrder];
              
              if (aPriority !== bPriority) return aPriority - bPriority;
              return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            })
            .map((request) => (
              <div
                key={request.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getStatusColor(request.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getTypeIcon(request.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {request.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(request.priority)}`}>
                          {request.priority === 'high' ? 'Haute' : 
                           request.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {getTypeLabel(request.type)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {request.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span>ID: {request.id}</span>
                          <span>Par: {request.userName}</span>
                          {request.amount && (
                            <span className="font-medium text-green-600">
                              {formatCurrency(request.amount)}
                            </span>
                          )}
                        </div>
                        <span>{formatTimeAgo(request.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      <span>Traiter</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Résumé en bas */}
      {filteredRequests.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-600">{counts.urgent}</p>
              <p className="text-xs text-gray-500">Urgentes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{counts.recharge}</p>
              <p className="text-xs text-gray-500">Recharges</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{counts.withdrawal}</p>
              <p className="text-xs text-gray-500">Retraits</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{counts.merchant_kyc}</p>
              <p className="text-xs text-gray-500">KYC</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
