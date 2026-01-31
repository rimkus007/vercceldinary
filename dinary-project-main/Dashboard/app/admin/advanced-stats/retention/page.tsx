"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Clock,
  UserCheck,
} from "lucide-react";
import ExportModal from "@/components/admin/ExportModal";
import FilterModal from "@/components/admin/FilterModal";
import {
  formatRetentionDataForExport,
  downloadCSV,
  downloadPDF,
} from "@/lib/export-utils";

interface RetentionData {
  period: string;
  newUsers: number;
  retained: number;
  retentionRate: number;
  churnRate: number;
  avgLifetime: number;
}

interface RetentionCohort {
  cohort: string;
  users: number;
  day1: number;
  day7: number;
  day30: number;
  day90: number;
  day365: number;
}

interface KPIRetention {
  retentionRate: number;
  churnRate: number;
  avgLifetime: number;
  newUsers: number;
}

export default function RetentionAnalysisPage() {
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [cohortData, setCohortData] = useState<RetentionCohort[]>([]);
  const [kpi, setKpi] = useState<KPIRetention | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // États pour les modaux
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      try {
        // Construire l'URL avec les paramètres
        const url = new URL(`${baseUrl}/admin/stats/retention`);
        if (selectedPeriod) {
          url.searchParams.set('period', selectedPeriod);
        }
        // Ajouter les filtres si présents
        Object.entries(appliedFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== '' && value !== null) {
            url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
          }
        });

        const response = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Impossible de récupérer les données de rétention.");
        }

        const data = await response.json();

        // Le backend retourne { retentionData, cohortData, kpi }
        setRetentionData(
          Array.isArray(data.retentionData)
            ? (data.retentionData as RetentionData[])
            : []
        );
        setCohortData(
          Array.isArray(data.cohortData)
            ? (data.cohortData as RetentionCohort[])
            : []
        );
        setKpi(data.kpi ?? null);
    } catch (err) {
        /* log removed */
      setError(
          err instanceof Error
            ? err.message
          : "Une erreur est survenue lors du chargement."
      );
    } finally {
      setLoading(false);
    }
  };

    fetchStats();
  }, [token, selectedPeriod, appliedFilters]);

  // Fonction d'export
  const handleExport = (format: 'csv' | 'pdf') => {
    const exportData = formatRetentionDataForExport({
      retentionData,
      cohortData,
      kpi,
    });

    const filename = `retention_${selectedPeriod}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      Object.entries(exportData).forEach(([key, data]) => {
        if (data && data.length > 0) {
          downloadCSV(data, `${filename}_${key}`);
        }
      });
    } else {
      downloadPDF(
        `Analyse de Rétention - ${selectedPeriod}`,
        exportData,
        filename,
        {
          pageTitle: 'Dinary Analytics',
          footer: `Période: ${selectedPeriod} | Généré le ${new Date().toLocaleDateString('fr-FR')}`,
        }
      );
    }
  };

  // Fonction pour appliquer les filtres
  const handleApplyFilters = (filters: Record<string, any>) => {
    setAppliedFilters(filters);
    // Les données seront automatiquement rechargées via useEffect
  };

  const getRetentionColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRetentionBadge = (rate: number) => {
    if (rate >= 80) return "bg-green-100 text-green-800";
    if (rate >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getCohortColor = (rate: number) => {
    const opacity = Math.max(0.2, rate / 100);
    return `rgba(59, 130, 246, ${opacity})`;
  };

  // Distribution categories for retention rates
  const totalPeriods = retentionData.length;
  const excellentCount = retentionData.filter(
    (item) => item.retentionRate >= 80
  ).length;
  const goodCount = retentionData.filter(
    (item) => item.retentionRate >= 60 && item.retentionRate < 80
  ).length;
  const poorCount = retentionData.filter(
    (item) => item.retentionRate < 60
  ).length;
  const excellentPct =
    totalPeriods > 0 ? Math.round((excellentCount / totalPeriods) * 100) : 0;
  const goodPct =
    totalPeriods > 0 ? Math.round((goodCount / totalPeriods) * 100) : 0;
  const poorPct =
    totalPeriods > 0 ? Math.round((poorCount / totalPeriods) * 100) : 0;

  // Compute KPI change compared to previous period
  const lastPeriod =
    retentionData.length > 0 ? retentionData[retentionData.length - 1] : null;
  const prevPeriod =
    retentionData.length > 1 ? retentionData[retentionData.length - 2] : null;
  const retentionDiff =
    lastPeriod && prevPeriod
      ? parseFloat(
          (lastPeriod.retentionRate - prevPeriod.retentionRate).toFixed(1)
        )
      : 0;
  const churnDiff =
    lastPeriod && prevPeriod
      ? parseFloat((lastPeriod.churnRate - prevPeriod.churnRate).toFixed(1))
      : 0;
  const lifetimeDiff =
    lastPeriod && prevPeriod
      ? parseFloat((lastPeriod.avgLifetime - prevPeriod.avgLifetime).toFixed(1))
      : 0;
  const newUsersDiff =
    lastPeriod && prevPeriod ? lastPeriod.newUsers - prevPeriod.newUsers : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analyse de Rétention
              </h1>
              <p className="text-gray-600">
                Suivi de la fidélisation et du cycle de vie des utilisateurs
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
                {Object.keys(appliedFilters).length > 0 && (
                  <Badge className="ml-2 bg-blue-600 text-white">
                    {Object.keys(appliedFilters).length}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex gap-2">
            {["7d", "30d", "90d", "6m", "1y"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Retention Rate Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Taux de Rétention Moyen
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {kpi?.retentionRate?.toFixed(1)}%
                  </p>
                  {retentionDiff !== 0 && (
                    <p
                      className={`text-xs flex items-center mt-1 ${
                        retentionDiff >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {retentionDiff >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {retentionDiff >= 0 ? "+" : ""}
                      {Math.abs(retentionDiff).toFixed(1)}% vs période
                      précédente
                    </p>
                  )}
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Churn Rate Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Taux de Churn
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {kpi?.churnRate?.toFixed(1)}%
                  </p>
                  {churnDiff !== 0 && (
                    <p
                      className={`text-xs flex items-center mt-1 ${
                        churnDiff <= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {churnDiff <= 0 ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      {churnDiff >= 0 ? "+" : ""}
                      {Math.abs(churnDiff).toFixed(1)}% vs période précédente
                    </p>
                  )}
                </div>
                <Users className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          {/* Average Lifetime Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Durée de Vie Moyenne
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {kpi?.avgLifetime?.toFixed(1)} jours
                  </p>
                  {lifetimeDiff !== 0 && (
                    <p
                      className={`text-xs flex items-center mt-1 ${
                        lifetimeDiff >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {lifetimeDiff >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {lifetimeDiff >= 0 ? "+" : ""}
                      {Math.abs(lifetimeDiff).toFixed(1)} jours vs période
                      précédente
                    </p>
                  )}
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* New Users Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Nouveaux Utilisateurs
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {kpi?.newUsers?.toLocaleString()}
                  </p>
                  {newUsersDiff !== 0 && (
                    <p
                      className={`text-xs flex items-center mt-1 ${
                        newUsersDiff >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {newUsersDiff >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {newUsersDiff >= 0 ? "+" : ""}
                      {Math.abs(newUsersDiff).toLocaleString()} vs période
                      précédente
                    </p>
                  )}
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Retention Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Évolution de la Rétention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.period}</p>
                      <p className="text-sm text-gray-500">
                        {item.newUsers} nouveaux utilisateurs
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getRetentionBadge(item.retentionRate)}>
                        {item.retentionRate}%
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.retained} retenus
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Distribution de la Rétention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Rétention Excellente (80%+)</span>
                    <span>{excellentPct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${excellentPct}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Rétention Bonne (60-79%)</span>
                    <span>{goodPct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${goodPct}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Rétention Faible (&lt;60%)</span>
                    <span>{poorPct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${poorPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cohort Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Analyse par Cohorte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Cohorte</th>
                    <th className="text-center py-3 px-2">Utilisateurs</th>
                    <th className="text-center py-3 px-2">Jour 1</th>
                    <th className="text-center py-3 px-2">Jour 7</th>
                    <th className="text-center py-3 px-2">Jour 30</th>
                    <th className="text-center py-3 px-2">Jour 90</th>
                    <th className="text-center py-3 px-2">Jour 365</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((cohort, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-2 font-medium">{cohort.cohort}</td>
                      <td className="py-3 px-2 text-center">
                        {cohort.users.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div
                          className="rounded px-2 py-1 text-xs font-medium text-white"
                          style={{
                            backgroundColor: getCohortColor(cohort.day1),
                          }}
                        >
                          {cohort.day1}%
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div
                          className="rounded px-2 py-1 text-xs font-medium text-white"
                          style={{
                            backgroundColor: getCohortColor(cohort.day7),
                          }}
                        >
                          {cohort.day7}%
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div
                          className="rounded px-2 py-1 text-xs font-medium text-white"
                          style={{
                            backgroundColor: getCohortColor(cohort.day30),
                          }}
                        >
                          {cohort.day30}%
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div
                          className="rounded px-2 py-1 text-xs font-medium text-white"
                          style={{
                            backgroundColor: getCohortColor(cohort.day90),
                          }}
                        >
                          {cohort.day90}%
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div
                          className="rounded px-2 py-1 text-xs font-medium text-white"
                          style={{
                            backgroundColor: getCohortColor(cohort.day365),
                          }}
                        >
                          {cohort.day365}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modaux */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExport}
          title="Exporter l'analyse de rétention"
        />

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyFilters}
          title="Filtrer les données de rétention"
          filters={[
            {
              id: 'retentionRate',
              label: 'Taux de rétention minimum (%)',
              type: 'range',
              min: 0,
              max: 100,
            },
            {
              id: 'period',
              label: 'Période de cohorte',
              type: 'select',
              options: [
                { value: 'all', label: 'Toutes les périodes' },
                { value: 'recent', label: '3 derniers mois' },
                { value: 'older', label: 'Plus de 3 mois' },
              ],
            },
            {
              id: 'cohortSize',
              label: 'Taille de cohorte minimum',
              type: 'range',
              min: 0,
              max: 1000,
            },
          ]}
        />
      </div>
    </div>
  );
}
