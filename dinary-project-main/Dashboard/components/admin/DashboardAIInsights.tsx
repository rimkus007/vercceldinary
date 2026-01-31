'use client';

import { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Store, 
  CreditCard,
  Eye,
  X,
  Lightbulb,
  Target,
  Clock
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'anomaly' | 'opportunity' | 'warning' | 'suggestion';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  timestamp: string;
  category: 'transactions' | 'users' | 'merchants' | 'security';
}

const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'anomaly',
    title: 'Hausse inhabituelle des paiements le samedi',
    description: 'Volume de transactions +45% par rapport aux samedis précédents. Zone géographique: Centre-ville.',
    confidence: 87,
    actionable: true,
    timestamp: '2025-06-02T10:30:00Z',
    category: 'transactions'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Commerçant suspect détecté',
    description: 'Merchant ID: MER_789 - 14 transactions avec le même client en 2h. Montant total: 2,450 DA.',
    confidence: 92,
    actionable: true,
    timestamp: '2025-06-02T09:15:00Z',
    category: 'security'
  },
  {
    id: '3',
    type: 'opportunity',
    title: 'Augmentation possible des revenus',
    description: 'Zone Alger-Est: +25% de nouveaux utilisateurs. Recommandation: campagne ciblée commerçants.',
    confidence: 78,
    actionable: true,
    timestamp: '2025-06-02T08:45:00Z',
    category: 'merchants'
  },
  {
    id: '4',
    type: 'suggestion',
    title: 'Optimisation des heures de pointe',
    description: 'Pics de charge 18h-20h: recommandation d\'incitations pour étaler la charge.',
    confidence: 65,
    actionable: false,
    timestamp: '2025-06-02T07:20:00Z',
    category: 'users'
  }
];

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'anomaly':
      return <TrendingUp className="w-5 h-5 text-orange-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case 'opportunity':
      return <Target className="w-5 h-5 text-green-500" />;
    case 'suggestion':
      return <Lightbulb className="w-5 h-5 text-blue-500" />;
    default:
      return <Brain className="w-5 h-5 text-gray-500" />;
  }
};

const getInsightColor = (type: string) => {
  switch (type) {
    case 'anomaly':
      return 'border-orange-200 bg-orange-50';
    case 'warning':
      return 'border-red-200 bg-red-50';
    case 'opportunity':
      return 'border-green-200 bg-green-50';
    case 'suggestion':
      return 'border-blue-200 bg-blue-50';
    default:
      return 'border-gray-200 bg-gray-50';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'transactions':
      return <CreditCard className="w-4 h-4" />;
    case 'users':
      return <Users className="w-4 h-4" />;
    case 'merchants':
      return <Store className="w-4 h-4" />;
    case 'security':
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <Brain className="w-4 h-4" />;
  }
};

export default function DashboardAIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>(mockInsights);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

  const dismissInsight = (insightId: string) => {
    setDismissedInsights(prev => [...prev, insightId]);
  };

  const activeInsights = insights.filter(insight => !dismissedInsights.includes(insight.id));

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes}min`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `Il y a ${diffInHours}h`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">AI Insights</h3>
            <p className="text-sm text-gray-500">Recommandations intelligentes</p>
          </div>
        </div>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {activeInsights.length} insights actifs
        </span>
      </div>

      <div className="space-y-4">
        {activeInsights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun insight disponible pour le moment</p>
          </div>
        ) : (
          activeInsights.map((insight) => (
            <div
              key={insight.id}
              className={`relative border rounded-lg p-4 ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {insight.title}
                      </h4>
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(insight.category)}
                        <span className="text-xs text-gray-500 capitalize">
                          {insight.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-gray-500">
                            Confiance: {insight.confidence}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(insight.timestamp)}
                        </span>
                      </div>
                      {insight.actionable && (
                        <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors">
                          Examiner
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissInsight(insight.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {activeInsights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Dernière mise à jour: {formatTimeAgo(new Date().toISOString())}
            </span>
            <button className="text-blue-600 hover:text-blue-700 transition-colors">
              Voir tous les insights
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
