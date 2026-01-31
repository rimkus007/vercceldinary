'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Activity, 
  Users, 
  CreditCard, 
  Store,
  Zap,
  TrendingUp,
  Eye,
  RotateCcw
} from 'lucide-react';

interface HeatmapZone {
  id: string;
  name: string;
  coordinates: [number, number];
  metrics: {
    transactions: number;
    users: number;
    merchants: number;
    revenue: number;
  };
  growth: number;
  activity: 'high' | 'medium' | 'low';
}

const mockZones: HeatmapZone[] = [
  {
    id: 'alger-centre',
    name: 'Alger Centre',
    coordinates: [36.7378, 3.0875],
    metrics: {
      transactions: 1240,
      users: 890,
      merchants: 156,
      revenue: 2450000
    },
    growth: 12.5,
    activity: 'high'
  },
  {
    id: 'oran-centre',
    name: 'Oran Centre',
    coordinates: [35.6911, -0.6417],
    metrics: {
      transactions: 890,
      users: 645,
      merchants: 112,
      revenue: 1780000
    },
    growth: 8.3,
    activity: 'high'
  },
  {
    id: 'constantine',
    name: 'Constantine',
    coordinates: [36.3650, 6.6147],
    metrics: {
      transactions: 567,
      users: 423,
      merchants: 78,
      revenue: 1120000
    },
    growth: 15.2,
    activity: 'medium'
  },
  {
    id: 'annaba',
    name: 'Annaba',
    coordinates: [36.9000, 7.7667],
    metrics: {
      transactions: 345,
      users: 267,
      merchants: 45,
      revenue: 680000
    },
    growth: 5.7,
    activity: 'medium'
  },
  {
    id: 'setif',
    name: 'Sétif',
    coordinates: [36.1833, 5.4000],
    metrics: {
      transactions: 234,
      users: 189,
      merchants: 32,
      revenue: 450000
    },
    growth: -2.1,
    activity: 'low'
  },
  {
    id: 'blida',
    name: 'Blida',
    coordinates: [36.4203, 2.8277],
    metrics: {
      transactions: 456,
      users: 334,
      merchants: 67,
      revenue: 890000
    },
    growth: 9.8,
    activity: 'medium'
  }
];

const getActivityColor = (activity: string, growth: number) => {
  if (growth > 10) return 'bg-green-500';
  if (activity === 'high') return 'bg-blue-500';
  if (activity === 'medium') return 'bg-yellow-500';
  return 'bg-red-500';
};

const getActivityIntensity = (activity: string) => {
  switch (activity) {
    case 'high': return 'opacity-90';
    case 'medium': return 'opacity-60';
    case 'low': return 'opacity-30';
    default: return 'opacity-50';
  }
};

export default function CarteInteractive() {
  const [selectedZone, setSelectedZone] = useState<HeatmapZone | null>(null);
  const [viewMode, setViewMode] = useState<'transactions' | 'users' | 'merchants' | 'revenue'>('transactions');
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTotalMetrics = () => {
    return mockZones.reduce((acc, zone) => ({
      transactions: acc.transactions + zone.metrics.transactions,
      users: acc.users + zone.metrics.users,
      merchants: acc.merchants + zone.metrics.merchants,
      revenue: acc.revenue + zone.metrics.revenue
    }), { transactions: 0, users: 0, merchants: 0, revenue: 0 });
  };

  const totalMetrics = getTotalMetrics();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Carte Interactive</h3>
            <p className="text-sm text-gray-500">Zones d'activité en temps réel</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshData}
            className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${
              isLoading ? 'animate-spin' : ''
            }`}
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'transactions', icon: CreditCard, label: 'Trans.' },
              { key: 'users', icon: Users, label: 'Users' },
              { key: 'merchants', icon: Store, label: 'Merch.' },
              { key: 'revenue', icon: TrendingUp, label: 'Rev.' }
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte stylisée */}
        <div className="lg:col-span-2">
          <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 h-80 overflow-hidden">
            <div className="absolute inset-0 bg-gray-100 rounded-lg opacity-20"></div>
            
            {/* Simulation de carte avec zones */}
            <div className="relative h-full">
              <svg className="w-full h-full" viewBox="0 0 400 300">
                {/* Contour de l'Algérie simplifié */}
                <path
                  d="M50 80 L350 80 L350 200 L320 220 L280 210 L200 230 L100 220 L50 200 Z"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  className="opacity-50"
                />
                
                {/* Zones d'activité */}
                {mockZones.map((zone, index) => {
                  const x = 50 + (index % 3) * 100 + Math.random() * 50;
                  const y = 100 + Math.floor(index / 3) * 80 + Math.random() * 30;
                  const size = Math.max(8, Math.min(20, zone.metrics[viewMode] / 100));
                  
                  return (
                    <g key={zone.id}>
                      <circle
                        cx={x}
                        cy={y}
                        r={size}
                        className={`${getActivityColor(zone.activity, zone.growth)} ${getActivityIntensity(zone.activity)} hover:opacity-100 transition-all cursor-pointer`}
                        onClick={() => setSelectedZone(zone)}
                      />
                      <text
                        x={x}
                        y={y + size + 15}
                        textAnchor="middle"
                        className="text-xs fill-gray-600 font-medium"
                      >
                        {zone.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Légende */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 text-xs">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Croissance élevée</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Activité forte</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Activité moyenne</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Activité faible</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau de détails */}
        <div className="space-y-4">
          {/* Métriques globales */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Totaux Nationaux</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transactions:</span>
                <span className="font-medium">{totalMetrics.transactions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Utilisateurs:</span>
                <span className="font-medium">{totalMetrics.users.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commerçants:</span>
                <span className="font-medium">{totalMetrics.merchants.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenus:</span>
                <span className="font-medium">{formatCurrency(totalMetrics.revenue)}</span>
              </div>
            </div>
          </div>

          {/* Détails de la zone sélectionnée */}
          {selectedZone ? (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">{selectedZone.name}</h4>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  selectedZone.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedZone.growth > 0 ? '+' : ''}{selectedZone.growth.toFixed(1)}%
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions:</span>
                  <span className="font-medium">{selectedZone.metrics.transactions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilisateurs actifs:</span>
                  <span className="font-medium">{selectedZone.metrics.users.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commerçants:</span>
                  <span className="font-medium">{selectedZone.metrics.merchants.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenus:</span>
                  <span className="font-medium">{formatCurrency(selectedZone.metrics.revenue)}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedZone(null)}
                className="mt-3 w-full text-center text-blue-600 hover:text-blue-700 text-sm"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Cliquez sur une zone pour voir les détails</p>
            </div>
          )}

          {/* Top zones */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Top Zones</h4>
            <div className="space-y-2">
              {mockZones
                .sort((a, b) => b.metrics[viewMode] - a.metrics[viewMode])
                .slice(0, 3)
                .map((zone, index) => (
                  <div key={zone.id} className="flex items-center space-x-2 text-sm">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === 0 ? 'bg-yellow-200 text-yellow-800' :
                      index === 1 ? 'bg-gray-200 text-gray-800' :
                      'bg-orange-200 text-orange-800'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="flex-1 text-gray-700">{zone.name}</span>
                    <span className="font-medium">
                      {viewMode === 'revenue' 
                        ? formatCurrency(zone.metrics[viewMode])
                        : zone.metrics[viewMode].toLocaleString()
                      }
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
