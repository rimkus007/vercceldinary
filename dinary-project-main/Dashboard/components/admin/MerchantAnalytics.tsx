"use client";

import { useState, useMemo } from "react";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Store, Users, MapPin, TrendingUp, DollarSign, PieChart } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

import type { Merchant } from "@/types/merchant";
interface MerchantAnalyticsProps {
  className?: string;
  merchants?: Merchant[];
}

export default function MerchantAnalytics({
  className = "",
  merchants = [],
}: MerchantAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "cities" | "revenue">("categories");

  // Analyses par catégorie
  const categoryAnalysis = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    const categoryRevenue: Record<string, number> = {};
    
    merchants.forEach((m) => {
      const cat = m.category || "other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (m.revenue ?? 0);
    });

    return { categoryCounts, categoryRevenue };
  }, [merchants]);

  // Analyses par ville
  const cityAnalysis = useMemo(() => {
    const cityCounts: Record<string, number> = {};
    const cityRevenue: Record<string, number> = {};
    
    merchants.forEach((m) => {
      const city = (m.city as string) ?? "Autre";
      cityCounts[city] = (cityCounts[city] || 0) + 1;
      cityRevenue[city] = (cityRevenue[city] || 0) + (m.revenue ?? 0);
    });

    return { cityCounts, cityRevenue };
  }, [merchants]);

  // Données pour graphique par catégories
  const categoryChartData = {
    labels: Object.keys(categoryAnalysis.categoryCounts),
    datasets: [
      {
        label: "Nombre de commerçants",
        data: Object.values(categoryAnalysis.categoryCounts),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(14, 165, 233, 0.7)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
          'rgb(14, 165, 233)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Données pour graphique par villes (Top 10)
  const topCities = Object.entries(cityAnalysis.cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const cityChartData = {
    labels: topCities.map(([city]) => city),
    datasets: [
      {
        label: "Commerçants par ville",
        data: topCities.map(([_, count]) => count),
        backgroundColor: 'rgba(0, 165, 165, 0.7)',
        borderColor: 'rgb(0, 165, 165)',
        borderWidth: 2,
      },
    ],
  };

  // Données pour graphique revenus par catégorie
  const revenueChartData = {
    labels: Object.keys(categoryAnalysis.categoryRevenue),
    datasets: [
      {
        label: "Revenus par catégorie (DZD)",
        data: Object.values(categoryAnalysis.categoryRevenue),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  // Statistiques rapides
  const quickStats = [
    {
      icon: Store,
      label: "Total Commerçants",
      value: merchants.length,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Users,
      label: "Commerçants Actifs",
      value: merchants.filter((m) => m.status === "active").length,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: MapPin,
      label: "Villes Couvertes",
      value: Object.keys(cityAnalysis.cityCounts).length,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: PieChart,
      label: "Catégories",
      value: Object.keys(categoryAnalysis.categoryCounts).length,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      icon: DollarSign,
      label: "Revenu Total",
      value: merchants.reduce((sum, m) => sum + (m.revenue ?? 0), 0).toLocaleString('fr-DZ') + " DZD",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      icon: TrendingUp,
      label: "Revenu Moyen",
      value: merchants.length > 0
        ? (merchants.reduce((sum, m) => sum + (m.revenue ?? 0), 0) / merchants.length).toFixed(0) + " DZD"
        : "0 DZD",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
    },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* En-tête */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-dinary-turquoise to-blue-600 bg-clip-text text-transparent">
          📊 Analyses Détaillées
        </h2>
        <p className="text-gray-600 text-sm mt-1">Statistiques et répartition des commerçants</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {quickStats.map((stat, index) => (
          <div key={index} className={`p-4 ${stat.bgColor} rounded-xl border-2 border-transparent hover:border-gray-200 transition-all`}>
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Onglets des graphiques */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "categories"
              ? "bg-white text-dinary-turquoise shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📁 Par Catégories
        </button>
        <button
          onClick={() => setActiveTab("cities")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "cities"
              ? "bg-white text-dinary-turquoise shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🏙️ Par Villes
        </button>
        <button
          onClick={() => setActiveTab("revenue")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "revenue"
              ? "bg-white text-dinary-turquoise shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          💰 Revenus
        </button>
      </div>

      {/* Zone des graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === "categories" && (
          <>
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Répartition par Catégories</h3>
              <div className="h-[300px]">
                <Pie data={categoryChartData} options={pieOptions} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Nombre par Catégorie</h3>
              <div className="h-[300px]">
                <Bar data={categoryChartData} options={chartOptions} />
              </div>
            </div>
          </>
        )}
        
        {activeTab === "cities" && (
          <>
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Top 10 Villes</h3>
              <div className="h-[300px]">
                <Bar data={cityChartData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Détails par Ville</h3>
              <div className="h-[300px] overflow-y-auto space-y-2">
                {Object.entries(cityAnalysis.cityCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 15)
                  .map(([city, count], idx) => (
                    <div key={city} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-500 w-8">#{idx + 1}</span>
                        <MapPin className="w-5 h-5 text-dinary-turquoise" />
                        <span className="font-medium text-gray-900">{city}</span>
                      </div>
                      <span className="px-3 py-1 bg-dinary-turquoise text-white rounded-full text-sm font-semibold">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
        
        {activeTab === "revenue" && (
          <>
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenus par Catégorie</h3>
              <div className="h-[300px]">
                <Bar data={revenueChartData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Distribution des Revenus</h3>
              <div className="h-[300px]">
                <Doughnut 
                  data={{
                    labels: Object.keys(categoryAnalysis.categoryRevenue),
                    datasets: [{
                      data: Object.values(categoryAnalysis.categoryRevenue),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(236, 72, 153, 0.7)',
                      ],
                    }],
                  }} 
                  options={pieOptions} 
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
