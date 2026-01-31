'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  CreditCard, 
  Calendar, 
  RefreshCw, 
  Ban,
  Download,
  Wallet,
  Briefcase,
  Clock
} from 'lucide-react';

interface RevenueSummary {
  totalCommissions: number;
  paymentCommissions: number;
  withdrawalCommissions: number;
  transferFees: number;
  baridiMobBalance: number;
  todayCommissions: number;
  weeklyCommissions: number;
  monthlyCommissions: number;
  pendingRecharges: number;
  pendingWithdrawals: number;
  lastSync: string;
}

interface Transaction {
  id: string;
  type: 'payment' | 'withdrawal' | 'transfer' | 'recharge';
  amount: number;
  commission: number;
  timestamp: string;
  details: string;
}

interface PlatformRevenuesProps {
  summary: RevenueSummary;
  recentTransactions: Transaction[];
}

const PlatformRevenues: React.FC<PlatformRevenuesProps> = ({ 
  summary,
  recentTransactions 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulation d'un appel API pour rafraîchir les données
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-DZ', { 
      style: 'currency', 
      currency: 'DZD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-DZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <DollarSign className="mr-2 text-dinary-turquoise" size={24} />
            Revenus de la plateforme
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Suivi des commissions et du solde BaridiMob
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>
            {isRefreshing ? 'Synchronisation...' : 'Synchroniser'}
          </span>
        </button>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Solde BaridiMob */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 mr-3">
                <Ban size={20} className="text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-800">Solde BaridiMob</h3>
            </div>
            <span className="text-xs text-gray-500 flex items-center">
              <Clock size={12} className="mr-1" />
              Dernière synchro: {formatDate(summary.lastSync)}
            </span>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold">{formatCurrency(summary.baridiMobBalance)}</p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500">Solde actuel</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-xs text-gray-500 block mb-1">Recharges en attente</span>
                <div className="flex items-center">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="font-medium">{formatCurrency(summary.pendingRecharges)}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-xs text-gray-500 block mb-1">Retraits en attente</span>
                <div className="flex items-center">
                  <ArrowDownRight size={16} className="text-red-500 mr-1" />
                  <span className="font-medium">{formatCurrency(summary.pendingWithdrawals)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Commissions totales */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100 mr-3">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <h3 className="font-medium text-gray-800">Commissions totales</h3>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold">{formatCurrency(summary.totalCommissions)}</p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-green-500 flex items-center">
                  <ArrowUpRight size={14} className="mr-1" />
                  +{formatCurrency(summary.todayCommissions)} aujourd'hui
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Aujourd'hui</span>
                <span className="text-sm font-medium">{formatCurrency(summary.todayCommissions)}</span>
              </div>
              
              <div>
                <span className="text-xs text-gray-500 block mb-1">Cette semaine</span>
                <span className="text-sm font-medium">{formatCurrency(summary.weeklyCommissions)}</span>
              </div>
              
              <div>
                <span className="text-xs text-gray-500 block mb-1">Ce mois</span>
                <span className="text-sm font-medium">{formatCurrency(summary.monthlyCommissions)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Répartition des commissions */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-amber-100 mr-3">
              <Briefcase size={20} className="text-amber-600" />
            </div>
            <h3 className="font-medium text-gray-800">Répartition des revenus</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1 items-center">
                  <span className="text-xs text-gray-500 flex items-center">
                    <CreditCard size={12} className="mr-1" />
                    Paiements (1.5%)
                  </span>
                  <span className="text-sm font-medium">{formatCurrency(summary.paymentCommissions)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(summary.paymentCommissions / summary.totalCommissions) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 items-center">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Download size={12} className="mr-1" />
                    Retraits (1%)
                  </span>
                  <span className="text-sm font-medium">{formatCurrency(summary.withdrawalCommissions)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${(summary.withdrawalCommissions / summary.totalCommissions) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 items-center">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Wallet size={12} className="mr-1" />
                    Virements (5 DZD)
                  </span>
                  <span className="text-sm font-medium">{formatCurrency(summary.transferFees)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${(summary.transferFees / summary.totalCommissions) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tableau des transactions récentes */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="font-medium text-gray-800">Transactions récentes (commissions)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'payment' ? 'bg-blue-100 text-blue-800' :
                      transaction.type === 'withdrawal' ? 'bg-green-100 text-green-800' :
                      transaction.type === 'transfer' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.type === 'payment' ? 'Paiement' :
                       transaction.type === 'withdrawal' ? 'Retrait' :
                       transaction.type === 'transfer' ? 'Virement' :
                       'Recharge'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    +{formatCurrency(transaction.commission)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          <div className="px-6 py-4 border-t">
          <a href="/admin/revenues" className="text-sm text-dinary-turquoise hover:underline flex items-center">
            <Calendar size={14} className="mr-1.5" />
            Voir l'historique complet
          </a>
        </div>
      </div>
    </div>
  );
};

export default PlatformRevenues;
