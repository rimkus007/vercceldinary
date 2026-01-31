'use client'

import { useState } from 'react';
import { 
  Settings, Power, Shield, Users, 
  CreditCard, AlertTriangle, RefreshCw, Pause,
  Play, Bell, Database, FileText,
  Download, Upload, Lock, Unlock,
  Eye, EyeOff, Zap, Activity
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'system' | 'users' | 'transactions' | 'security' | 'reports';
  danger?: boolean;
  requiresConfirmation?: boolean;
  status?: 'active' | 'inactive' | 'maintenance';
  lastUsed?: string;
}

// Mock data
const quickActions: QuickAction[] = [
  {
    id: 'maintenance_mode',
    title: 'Mode Maintenance',
    description: 'Activer/désactiver le mode maintenance',
    icon: <Settings className="w-5 h-5" />,
    category: 'system',
    status: 'inactive',
    requiresConfirmation: true,
    lastUsed: '2025-05-20'
  },
  {
    id: 'emergency_stop',
    title: 'Arrêt d\'urgence',
    description: 'Stopper toutes les transactions',
    icon: <Power className="w-5 h-5" />,
    category: 'system',
    danger: true,
    requiresConfirmation: true
  },
  {
    id: 'freeze_accounts',
    title: 'Geler comptes suspects',
    description: 'Geler automatiquement les comptes à risque',
    icon: <Shield className="w-5 h-5" />,
    category: 'security',
    status: 'active'
  },
  {
    id: 'bulk_notifications',
    title: 'Notification massive',
    description: 'Envoyer une notification à tous les utilisateurs',
    icon: <Bell className="w-5 h-5" />,
    category: 'users',
    lastUsed: '2025-06-01'
  },
  {
    id: 'transaction_limits',
    title: 'Limites transactions',
    description: 'Ajuster les limites de transaction',
    icon: <CreditCard className="w-5 h-5" />,
    category: 'transactions',
    status: 'active'
  },
  {
    id: 'backup_database',
    title: 'Sauvegarde DB',
    description: 'Lancer une sauvegarde complète',
    icon: <Database className="w-5 h-5" />,
    category: 'system',
    lastUsed: '2025-06-02'
  },
  {
    id: 'export_reports',
    title: 'Export rapports',
    description: 'Exporter tous les rapports du jour',
    icon: <Download className="w-5 h-5" />,
    category: 'reports',
    lastUsed: '2025-06-02'
  },
  {
    id: 'clear_cache',
    title: 'Vider cache',
    description: 'Purger le cache système',
    icon: <RefreshCw className="w-5 h-5" />,
    category: 'system'
  },
  {
    id: 'fraud_scan',
    title: 'Scan fraudes',
    description: 'Lancer détection automatique',
    icon: <Eye className="w-5 h-5" />,
    category: 'security',
    status: 'active'
  }
];

const systemStatus = {
  api: { status: 'operational', response: '120ms' },
  database: { status: 'operational', connections: 45 },
  payments: { status: 'operational', processing: 1250 },
  notifications: { status: 'degraded', queue: 89 },
  backup: { status: 'operational', lastBackup: '2h ago' }
};

export default function CentreControleRapide() {
  const [actions] = useState<QuickAction[]>(quickActions);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Settings className="w-4 h-4" />;
      case 'users': return <Users className="w-4 h-4" />;
      case 'transactions': return <CreditCard className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'reports': return <FileText className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'text-blue-600 bg-blue-50';
      case 'users': return 'text-green-600 bg-green-50';
      case 'transactions': return 'text-purple-600 bg-purple-50';
      case 'security': return 'text-red-600 bg-red-50';
      case 'reports': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50';
      default: return '';
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredActions = actions.filter(action => 
    selectedCategory === 'all' || action.category === selectedCategory
  );

  const executeAction = async (actionId: string) => {
    setIsExecuting(actionId);
    // Simulation d'exécution
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExecuting(null);
    setConfirmAction(null);
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'system': return 'Système';
      case 'users': return 'Utilisateurs';
      case 'transactions': return 'Transactions';
      case 'security': return 'Sécurité';
      case 'reports': return 'Rapports';
      default: return category;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Centre de Contrôle Rapide</h3>
            <p className="text-sm text-gray-500">Actions administratives instantanées</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Système opérationnel</span>
          </div>
        </div>
      </div>

      {/* Statut du système */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-800 mb-3">État du Système</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(systemStatus).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSystemStatusColor(value.status)}`}>
                <div className="w-2 h-2 rounded-full bg-current"></div>
                {value.status}
              </div>
              <div className="text-sm font-medium text-gray-800 mt-1 capitalize">{key}</div>
              <div className="text-xs text-gray-500">
                {'response' in value && `${value.response}`}
                {'connections' in value && `${value.connections} conn.`}
                {'processing' in value && `${value.processing} tx/min`}
                {'queue' in value && `${value.queue} en file`}
                {'lastBackup' in value && value.lastBackup}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Toutes
        </button>
        {['system', 'users', 'transactions', 'security', 'reports'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              selectedCategory === category 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {getCategoryIcon(category)}
            {getCategoryName(category)}
          </button>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActions.map((action) => (
          <div 
            key={action.id} 
            className={`border rounded-lg p-4 transition-all hover:shadow-md ${
              action.danger ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  action.danger ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(action.category)}`}>
                  {getCategoryName(action.category)}
                </span>
                {action.status && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(action.status)}`}>
                    {action.status}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {action.lastUsed && `Dernière utilisation: ${action.lastUsed}`}
              </div>
              <button
                onClick={() => {
                  if (action.requiresConfirmation) {
                    setConfirmAction(action.id);
                  } else {
                    executeAction(action.id);
                  }
                }}
                disabled={isExecuting === action.id}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  action.danger 
                    ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'
                }`}
              >
                {isExecuting === action.id ? (
                  <div className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    En cours...
                  </div>
                ) : (
                  'Exécuter'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmation */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Confirmation requise</h3>
                <p className="text-sm text-gray-600">Cette action ne peut pas être annulée</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Êtes-vous sûr de vouloir exécuter l'action "
                <strong>{actions.find(a => a.id === confirmAction)?.title}</strong>" ?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => executeAction(confirmAction)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredActions.length === 0 && (
        <div className="text-center py-8">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune action trouvée pour cette catégorie</p>
        </div>
      )}
    </div>
  );
}
