'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DollarSign, 
  Download, 
  Calendar, 
  Search, 
  ChevronDown, 
  ArrowUp,
  ArrowDown,
  RefreshCw,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Enregistrer les éléments Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

// Interface pour le tableau historique
interface CommissionHistoryEntry {
  id: string;
  date: string;  // ISO date
  type: string;
  transactionAmount: number;
  commissionAmount: number;
  commissionRate: string;
  senderName?: string | null;
  senderEmail?: string | null;
  receiverName?: string | null;
  receiverEmail?: string | null;
  details: string;
}

interface RevenueData {
  totalRevenue: number;
  transactionCount: number;
  revenueByType: Record<string, { count: number; total: number }>;
  history: CommissionHistoryEntry[];
}

export default function RevenuesPage() {
  const { token } = useAuth();
  const [period, setPeriod] = useState('all');
  const [chartPeriod, setChartPeriod] = useState('7days'); // Nouvelle période pour le graphique
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);

  // Calculer les dates selon la période sélectionnée
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date = now;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        startDate = undefined;
        break;
    }

    return { startDate, endDate };
  };

  // Charger les données des revenus
  const loadRevenueData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const { startDate, endDate } = getDateRange();
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/revenues?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Erreur lors du chargement des revenus');
      
      const data: RevenueData = await response.json();
      setRevenueData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, [token, period]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRevenueData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  // Filtrer les données
  const filteredData = revenueData?.history.filter(entry => {
    // Filtre par type
    if (filterType !== 'all' && entry.type !== filterType.toUpperCase()) {
      return false;
    }

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        entry.id.toLowerCase().includes(searchLower) ||
        entry.senderName?.toLowerCase().includes(searchLower) ||
        entry.receiverName?.toLowerCase().includes(searchLower) ||
        entry.details.toLowerCase().includes(searchLower)
      );
    }

    return true;
  }) || [];

  // Trier les données
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortField === 'amount') {
      return sortDirection === 'asc'
        ? a.commissionAmount - b.commissionAmount
        : b.commissionAmount - a.commissionAmount;
    }
    return 0;
  });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Calculer les statistiques de commission (sur TOUTES les données, pas filtrées)
  const allData = revenueData?.history || [];
  const totalCommissions = allData.reduce((sum, entry) => sum + entry.commissionAmount, 0);
  const paymentCommissions = allData
    .filter(entry => entry.type === 'PAYMENT')
    .reduce((sum, entry) => sum + entry.commissionAmount, 0);
  const withdrawalCommissions = allData
    .filter(entry => entry.type === 'WITHDRAWAL')
    .reduce((sum, entry) => sum + entry.commissionAmount, 0);
  const transferCommissions = allData
    .filter(entry => entry.type === 'TRANSFER')
    .reduce((sum, entry) => sum + entry.commissionAmount, 0);

  // Données pour le graphique en doughnut avec couleurs uniques
  const colorPalette = [
    { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' },      // Bleu
    { bg: 'rgba(147, 51, 234, 0.8)', border: 'rgba(147, 51, 234, 1)' },      // Violet
    { bg: 'rgba(34, 197, 94, 0.8)', border: 'rgba(34, 197, 94, 1)' },        // Vert
    { bg: 'rgba(251, 146, 60, 0.8)', border: 'rgba(251, 146, 60, 1)' },      // Orange
    { bg: 'rgba(236, 72, 153, 0.8)', border: 'rgba(236, 72, 153, 1)' },      // Rose
    { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgba(168, 85, 247, 1)' },      // Violet clair
    { bg: 'rgba(14, 165, 233, 0.8)', border: 'rgba(14, 165, 233, 1)' },      // Cyan
    { bg: 'rgba(234, 179, 8, 0.8)', border: 'rgba(234, 179, 8, 1)' },        // Jaune
    { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)' },        // Rouge
    { bg: 'rgba(20, 184, 166, 0.8)', border: 'rgba(20, 184, 166, 1)' },      // Teal
  ];

  const revenueTypes = Object.entries(revenueData?.revenueByType || {});
  
  // Mapper les couleurs avec rouge pour TRANSFER
  const getColorForType = (type: string, index: number) => {
    // Rouge pour les virements (TRANSFER)
    if (type === 'TRANSFER') {
      return { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)' };
    }
    return colorPalette[index % colorPalette.length];
  };
  
  const revenueByTypeData = {
    labels: revenueTypes.map(([type]) => {
      const labels: Record<string, string> = {
        PAYMENT: 'Paiements',
        TRANSFER: 'Virements',
        WITHDRAWAL: 'Retraits',
        RECHARGE: 'Recharges',
        MERCHANT_RECHARGE_DEBIT: 'Recharge marchand (débit)',
        RECHARGE_FROM_MERCHANT: 'Recharge depuis marchand',
        REFUND: 'Remboursements',
        BONUS: 'Bonus',
      };
      return labels[type] || type;
    }),
    datasets: [
      {
        data: revenueTypes.map(([, value]) => value.total),
        backgroundColor: revenueTypes.map(([type], index) => getColorForType(type, index).bg),
        borderColor: revenueTypes.map(([type], index) => getColorForType(type, index).border),
        borderWidth: 2,
      },
    ],
  };

  // Données pour le graphique en barres avec différentes périodes
  const getRevenueByPeriod = () => {
    const days: Record<string, number> = {};
    let numberOfPeriods = 7;
    let dateFormat: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    
    // Déterminer le nombre de périodes selon la sélection
    switch (chartPeriod) {
      case '7days':
        numberOfPeriods = 7;
        dateFormat = { day: '2-digit', month: 'short' };
        break;
      case '30days':
        numberOfPeriods = 30;
        dateFormat = { day: '2-digit', month: 'short' };
        break;
      case '3months':
        numberOfPeriods = 90;
        dateFormat = { day: '2-digit', month: 'short' };
        break;
      case '6months':
        numberOfPeriods = 180;
        dateFormat = { month: 'short', year: 'numeric' };
        break;
      case '1year':
        numberOfPeriods = 365;
        dateFormat = { month: 'short', year: 'numeric' };
        break;
    }
    
    // Créer le tableau de dates
    const periodDays = Array.from({ length: numberOfPeriods }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    periodDays.forEach(day => {
      days[day] = 0;
    });

    filteredData.forEach(entry => {
      const day = entry.date.split('T')[0];
      if (days[day] !== undefined) {
        days[day] += entry.commissionAmount;
      }
    });

    // Grouper par semaine ou mois pour les grandes périodes
    let finalLabels: string[];
    let finalData: number[];
    
    if (chartPeriod === '6months' || chartPeriod === '1year') {
      // Grouper par mois
      const monthlyData: Record<string, number> = {};
      periodDays.forEach(day => {
        const monthKey = day.substring(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
        monthlyData[monthKey] += days[day];
      });
      
      finalLabels = Object.keys(monthlyData).map(monthKey => {
        const [year, month] = monthKey.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      });
      finalData = Object.values(monthlyData);
    } else if (chartPeriod === '3months') {
      // Grouper par semaine
      const weeklyData: Record<string, number> = {};
      periodDays.forEach(day => {
        const date = new Date(day);
        const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate()) / 7)}`;
        if (!weeklyData[weekKey]) weeklyData[weekKey] = 0;
        weeklyData[weekKey] += days[day];
      });
      
      finalLabels = Object.keys(weeklyData).map((_, index) => `S${index + 1}`);
      finalData = Object.values(weeklyData);
    } else {
      // Afficher tous les jours
      finalLabels = periodDays.map(d => new Date(d).toLocaleDateString('fr-FR', dateFormat));
      finalData = periodDays.map(d => days[d]);
    }

    return {
      labels: finalLabels,
      datasets: [
        {
          label: 'Revenus (DZD)',
          data: finalData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  // Format monétaire
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })} DZD`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Montant Transaction', 'Commission', 'Taux', 'Expéditeur', 'Destinataire', 'Détails'];
    const rows = sortedData.map(entry => [
      entry.id,
      formatDate(entry.date),
      entry.type,
      entry.transactionAmount,
      entry.commissionAmount,
      entry.commissionRate,
      entry.senderName || 'N/A',
      entry.receiverName || 'N/A',
      entry.details
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `revenus_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des revenus...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Erreur : {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Revenus de la plateforme
          </h1>
            <p className="text-sm text-gray-500 mt-1">
              Suivez toutes vos sources de revenus et analysez les tendances
            </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative inline-block">
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none border rounded-lg pl-3 pr-8 py-2 bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="day">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
              <option value="all">Tout</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
          
          <button 
            onClick={exportToCSV}
            className="flex items-center px-3 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg text-white rounded-lg transition-shadow"
          >
            <Download size={16} className="mr-2" />
            Exporter CSV
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Commissions totales</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData?.totalRevenue || 0)}</h3>
          <div className="flex items-center mt-2 text-xs text-blue-600">
            <TrendingUp size={14} className="mr-1" />
            <span>{revenueData?.transactionCount || 0} transactions</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Commissions paiements</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(paymentCommissions)}</h3>
          <div className="flex items-center mt-2 text-xs text-blue-600">
            <PieChart size={14} className="mr-1" />
            <span>{Math.round((paymentCommissions / totalCommissions) * 100 || 0)}% du total</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Commissions retraits</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(withdrawalCommissions)}</h3>
          <div className="flex items-center mt-2 text-xs text-green-600">
            <PieChart size={14} className="mr-1" />
            <span>{Math.round((withdrawalCommissions / totalCommissions) * 100 || 0)}% du total</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-1">Commissions virements</p>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(transferCommissions)}</h3>
          <div className="flex items-center mt-2 text-xs text-red-600">
            <PieChart size={14} className="mr-1" />
            <span>{Math.round((transferCommissions / totalCommissions) * 100 || 0)}% du total</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 italic">Transferts entre utilisateurs</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800">Répartition des commissions</h3>
            <p className="text-sm text-gray-500">Par type de transaction</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={revenueByTypeData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      padding: 15,
                      usePointStyle: true
                    }
                  },
                }
              }}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-800">
                Évolution des revenus
              </h3>
              <p className="text-sm text-gray-500">
                {chartPeriod === '7days' && '7 derniers jours'}
                {chartPeriod === '30days' && '30 derniers jours'}
                {chartPeriod === '3months' && '3 derniers mois (par semaine)'}
                {chartPeriod === '6months' && '6 derniers mois'}
                {chartPeriod === '1year' && '12 derniers mois'}
              </p>
            </div>
            <div className="relative">
              <select 
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
                className="appearance-none border rounded-lg px-3 py-2 pr-8 bg-white text-sm text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              >
                <option value="7days">7 jours</option>
                <option value="30days">30 jours</option>
                <option value="3months">3 mois</option>
                <option value="6months">6 mois</option>
                <option value="1year">1 an</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
          <div className="h-64">
            <Bar 
              data={getRevenueByPeriod()}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value: any) {
                        return value.toLocaleString('fr-FR') + ' DZD';
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
          <h3 className="text-lg font-medium text-gray-800">Historique détaillé des commissions</h3>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="pl-10 pr-3 py-2 border rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none border rounded-lg px-3 py-2 pr-8 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="payment">Paiements</option>
                <option value="withdrawal">Retraits</option>
                <option value="transfer">Virements</option>
                <option value="recharge">Recharges</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortField === 'date' && (
                      sortDirection === 'asc' 
                      ? <ArrowUp size={14} className="ml-1" /> 
                      : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant transaction
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center">
                    Commission
                    {sortField === 'amount' && (
                      sortDirection === 'asc' 
                      ? <ArrowUp size={14} className="ml-1" /> 
                      : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client/Marchand
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Aucune donnée de commission disponible pour la période sélectionnée
                  </td>
                </tr>
              ) : (
                sortedData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{entry.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.type === 'PAYMENT' ? 'bg-blue-100 text-blue-800' :
                        entry.type === 'WITHDRAWAL' ? 'bg-green-100 text-green-800' :
                        entry.type === 'TRANSFER' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                        {entry.type === 'PAYMENT' ? 'Paiement' :
                         entry.type === 'WITHDRAWAL' ? 'Retrait' :
                         entry.type === 'TRANSFER' ? 'Virement' :
                       'Recharge'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(entry.transactionAmount)}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      +{formatCurrency(entry.commissionAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.commissionRate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.receiverName ? (
                        <span className="text-blue-600 font-medium">
                          {entry.receiverName}
                      </span>
                      ) : entry.senderName ? (
                        <span className="text-blue-600 font-medium">
                          {entry.senderName}
                      </span>
                    ) : '-'}
                  </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {entry.details}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
