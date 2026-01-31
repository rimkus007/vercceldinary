'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserCheck, 
  UserX, 
  CreditCard,
  Wallet,
  Gift,
  Activity,
  Target,
  Clock,
  Store
} from 'lucide-react';

interface KPIMetric {
  id: string;
  title: string;
  value: number;
  previousValue: number;
  unit: string;
  format: 'number' | 'percentage' | 'currency';
  icon: React.ReactNode;
  color: string;
  description: string;
}

const mockKPIs: KPIMetric[] = [
  {
    id: 'user-retention',
    title: 'Taux de rétention utilisateurs',
    value: 78.5,
    previousValue: 72.3,
    unit: '%',
    format: 'percentage',
    icon: <UserCheck className="w-5 h-5" />,
    color: 'text-green-600',
    description: 'Utilisateurs actifs cette semaine vs semaine dernière'
  },
  {
    id: 'merchant-retention',
    title: 'Rétention commerçants',
    value: 91.2,
    previousValue: 89.7,
    unit: '%',
    format: 'percentage',
    icon: <Store className="w-5 h-5" />,
    color: 'text-blue-600',
    description: 'Commerçants ayant traité au moins 1 transaction cette semaine'
  },
  {
    id: 'bonus-vs-real',
    title: 'Paiements bonus vs réel',
    value: 35.8,
    previousValue: 42.1,
    unit: '%',
    format: 'percentage',
    icon: <Gift className="w-5 h-5" />,
    color: 'text-purple-600',
    description: '% des paiements effectués avec le solde bonus'
  },
  {
    id: 'user-activation',
    title: 'Taux d\'activation utilisateur',
    value: 68.9,
    previousValue: 65.4,
    unit: '%',
    format: 'percentage',
    icon: <Activity className="w-5 h-5" />,
    color: 'text-orange-600',
    description: 'Nouveaux utilisateurs ayant effectué leur 1er paiement'
  },
  {
    id: 'merchant-churn',
    title: 'Taux de churn commerçant',
    value: 8.3,
    previousValue: 12.1,
    unit: '%',
    format: 'percentage',
    icon: <UserX className="w-5 h-5" />,
    color: 'text-red-600',
    description: 'Commerçants inactifs depuis plus de 30 jours'
  },
  {
    id: 'avg-transaction',
    title: 'Transaction moyenne',
    value: 1250,
    previousValue: 1180,
    unit: 'DA',
    format: 'currency',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'text-teal-600',
    description: 'Montant moyen par transaction cette semaine'
  }
];

const formatValue = (value: number, format: string, unit: string) => {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}${unit}`;
    case 'currency':
      return `${value.toLocaleString('fr-FR')} ${unit}`;
    case 'number':
    default:
      return `${value.toLocaleString('fr-FR')}${unit}`;
  }
};

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export default function KPIAdvanced() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">KPIs Stratégiques</h3>
            <p className="text-sm text-gray-500">Métriques avancées de performance</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Dernière mise à jour: il y a 5min</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockKPIs.map((kpi) => {
          const change = calculateChange(kpi.value, kpi.previousValue);
          const isPositive = change >= 0;
          const isPositiveGood = !kpi.title.toLowerCase().includes('churn');

          return (
            <div
              key={kpi.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${kpi.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                  <div className={kpi.color}>
                    {kpi.icon}
                  </div>
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  (isPositive && isPositiveGood) || (!isPositive && !isPositiveGood)
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(change).toFixed(1)}%</span>
                </div>
              </div>

              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-600 mb-1">
                  {kpi.title}
                </h4>
                <p className="text-2xl font-bold text-gray-900">
                  {formatValue(kpi.value, kpi.format, kpi.unit)}
                </p>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                {kpi.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Précédent: {formatValue(kpi.previousValue, kpi.format, kpi.unit)}
                </span>
                <span className="text-gray-300">•</span>
                <span>7 jours</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé rapide */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {mockKPIs.filter(kpi => calculateChange(kpi.value, kpi.previousValue) > 0).length}
            </p>
            <p className="text-xs text-gray-500">KPIs en hausse</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {mockKPIs.filter(kpi => calculateChange(kpi.value, kpi.previousValue) < 0).length}
            </p>
            <p className="text-xs text-gray-500">KPIs en baisse</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {(mockKPIs.reduce((acc, kpi) => acc + Math.abs(calculateChange(kpi.value, kpi.previousValue)), 0) / mockKPIs.length).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Variation moyenne</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {mockKPIs.filter(kpi => Math.abs(calculateChange(kpi.value, kpi.previousValue)) > 5).length}
            </p>
            <p className="text-xs text-gray-500">Variations significatives</p>
          </div>
        </div>
      </div>
    </div>
  );
}
