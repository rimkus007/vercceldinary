'use client'

import { useState } from 'react';
import { 
  AlertTriangle, Shield, Eye, Ban, 
  User, CreditCard, TrendingUp, Clock,
  RefreshCw, Filter, Search, ExternalLink
} from 'lucide-react';

interface SuspiciousBehavior {
  id: string;
  type: 'multiple_devices' | 'unusual_pattern' | 'high_frequency' | 'location_anomaly' | 'amount_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  userName: string;
  description: string;
  detectedAt: string;
  riskScore: number;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  details: {
    transactions?: number;
    timeframe?: string;
    locations?: string[];
    devices?: string[];
    amounts?: number[];
  };
  actions: string[];
}

// Mock data
const mockBehaviors: SuspiciousBehavior[] = [
  {
    id: '1',
    type: 'multiple_devices',
    severity: 'high',
    userId: 'user_123',
    userName: 'Mohamed Larbi',
    description: 'Connexions simultanées depuis 5 appareils différents',
    detectedAt: '2025-06-02T10:30:00Z',
    riskScore: 85,
    status: 'new',
    details: {
      devices: ['iPhone 14', 'Samsung Galaxy S23', 'MacBook Pro', 'Dell Laptop', 'Huawei Tablet'],
      timeframe: '30 minutes'
    },
    actions: ['Geler temporairement', 'Demander vérification', 'Surveiller']
  },
  {
    id: '2',
    type: 'unusual_pattern',
    severity: 'critical',
    userId: 'user_456',
    userName: 'Amina Benaissa',
    description: 'Pattern de paiement inhabituel - 50 transactions identiques',
    detectedAt: '2025-06-02T09:45:00Z',
    riskScore: 95,
    status: 'investigating',
    details: {
      transactions: 50,
      timeframe: '2 heures',
      amounts: [1000, 1000, 1000, 1000, 1000]
    },
    actions: ['Bloquer compte', 'Contacter utilisateur', 'Enquête approfondie']
  },
  {
    id: '3',
    type: 'location_anomaly',
    severity: 'medium',
    userId: 'user_789',
    userName: 'Karim Meziani',
    description: 'Transactions depuis des localisations éloignées en peu de temps',
    detectedAt: '2025-06-02T08:20:00Z',
    riskScore: 70,
    status: 'resolved',
    details: {
      locations: ['Alger', 'Oran', 'Constantine'],
      timeframe: '1 heure',
      transactions: 3
    },
    actions: ['Vérifiée comme légitime']
  },
  {
    id: '4',
    type: 'amount_anomaly',
    severity: 'high',
    userId: 'user_321',
    userName: 'Fatima Kadi',
    description: 'Montants de transaction 500% au-dessus de la moyenne',
    detectedAt: '2025-06-02T07:15:00Z',
    riskScore: 78,
    status: 'new',
    details: {
      amounts: [50000, 45000, 55000],
      timeframe: 'Moyenne habituelle: 2,000 DA'
    },
    actions: ['Vérifier source des fonds', 'Demander justificatifs']
  }
];

export default function ComportementsSupects() {
  const [behaviors] = useState<SuspiciousBehavior[]>(mockBehaviors);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getBehaviorIcon = (type: string) => {
    switch (type) {
      case 'multiple_devices': return <Shield className="w-5 h-5" />;
      case 'unusual_pattern': return <TrendingUp className="w-5 h-5" />;
      case 'high_frequency': return <RefreshCw className="w-5 h-5" />;
      case 'location_anomaly': return <Eye className="w-5 h-5" />;
      case 'amount_anomaly': return <CreditCard className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-50';
      case 'investigating': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'false_positive': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 90) return 'text-red-600 bg-red-50';
    if (score >= 70) return 'text-orange-600 bg-orange-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const filteredBehaviors = behaviors.filter(behavior => {
    const matchesSeverity = selectedSeverity === 'all' || behavior.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || behavior.status === selectedStatus;
    const matchesSearch = behavior.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         behavior.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'multiple_devices': return 'Appareils multiples';
      case 'unusual_pattern': return 'Pattern inhabituel';
      case 'high_frequency': return 'Haute fréquence';
      case 'location_anomaly': return 'Anomalie géographique';
      case 'amount_anomaly': return 'Montant anormal';
      default: return type;
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'new': return 'Nouveau';
      case 'investigating': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'false_positive': return 'Faux positif';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Comportements Suspects</h3>
            <p className="text-sm text-gray-500">Détection automatique d'activités anormales</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
            {filteredBehaviors.filter(b => b.status === 'new').length} nouveaux
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            {filteredBehaviors.length} total
          </span>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher par nom d'utilisateur ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Toutes sévérités</option>
            <option value="critical">Critique</option>
            <option value="high">Élevée</option>
            <option value="medium">Moyenne</option>
            <option value="low">Faible</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Tous statuts</option>
            <option value="new">Nouveau</option>
            <option value="investigating">En cours</option>
            <option value="resolved">Résolu</option>
            <option value="false_positive">Faux positif</option>
          </select>
        </div>
      </div>

      {/* Liste des comportements suspects */}
      <div className="space-y-4">
        {filteredBehaviors.map((behavior) => (
          <div key={behavior.id} className={`border-l-4 rounded-lg p-4 ${getSeverityColor(behavior.severity)}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getBehaviorIcon(behavior.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{getTypeName(behavior.type)}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(behavior.status)}`}>
                      {getStatusName(behavior.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {behavior.userName} ({behavior.userId})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(behavior.detectedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{behavior.description}</p>
                  
                  {/* Détails */}
                  <div className="bg-white bg-opacity-50 rounded-lg p-3 text-sm">
                    {behavior.details.devices && (
                      <div className="mb-2">
                        <strong>Appareils:</strong> {behavior.details.devices.join(', ')}
                      </div>
                    )}
                    {behavior.details.locations && (
                      <div className="mb-2">
                        <strong>Localisations:</strong> {behavior.details.locations.join(' → ')}
                      </div>
                    )}
                    {behavior.details.transactions && (
                      <div className="mb-2">
                        <strong>Transactions:</strong> {behavior.details.transactions} en {behavior.details.timeframe}
                      </div>
                    )}
                    {behavior.details.amounts && (
                      <div className="mb-2">
                        <strong>Montants:</strong> {behavior.details.amounts.slice(0, 3).map(a => `${a.toLocaleString()} DA`).join(', ')}
                        {behavior.details.amounts.length > 3 && '...'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskScoreColor(behavior.riskScore)}`}>
                  Risque: {behavior.riskScore}%
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions recommandées */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-white border-opacity-50">
              {behavior.actions.map((action, index) => (
                <button
                  key={index}
                  className="px-3 py-1 text-xs bg-white bg-opacity-75 hover:bg-opacity-100 text-gray-700 rounded-lg transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredBehaviors.length === 0 && (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun comportement suspect détecté avec les filtres actuels</p>
        </div>
      )}
    </div>
  );
}
