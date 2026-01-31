"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingDown,
  TrendingUp,
  Users,
  AlertTriangle,
  Clock,
  Target,
  Download,
  Filter,
  UserX,
  ArrowDown,
  Calendar,
  Shield,
} from "lucide-react";
import ExportModal from "@/components/admin/ExportModal";
import FilterModal from "@/components/admin/FilterModal";
import {
  formatChurnDataForExport,
  downloadCSV,
  downloadPDF,
} from "@/lib/export-utils";

interface ChurnMetric {
  name: string;
  current: number;
  previous: number;
  target: number;
  trend: "up" | "down" | "stable";
  risk: "low" | "medium" | "high";
}

interface ChurnSegment {
  segment: string;
  totalUsers: number;
  churned: number;
  churnRate: number;
  avgLifetime: number;
  revenueImpact: number;
  riskLevel: "low" | "medium" | "high";
}

interface ChurnReason {
  reason: string;
  percentage: number;
  users: number;
  impact: number;
  actionable: boolean;
}

interface AtRiskUser {
  id: string;
  name: string;
  email: string;
  riskScore: number;
  lastActivity: string;
  lifetime: number;
  revenue: number;
  predictedChurn: number;
}

export default function ChurnAnalysisPage() {
  const [churnMetrics, setChurnMetrics] = useState<ChurnMetric[]>([]);
  const [segments, setSegments] = useState<ChurnSegment[]>([]);
  const [reasons, setReasons] = useState<ChurnReason[]>([]);
  const [atRiskUsers, setAtRiskUsers] = useState<AtRiskUser[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30d");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // États pour les modaux
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!token) return;

    const fetchChurn = async () => {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      try {
        // Construire l'URL avec les paramètres
        const url = new URL(`${baseUrl}/admin/stats/churn`);
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
          throw new Error("Impossible de récupérer les données de churn.");
        }

          const data = await response.json();
        
        // Log pour débogage - voir ce que le backend retourne
        /* log removed */

        // Le backend retourne { metrics, segments, reasons, atRiskUsers }
          setChurnMetrics(
            Array.isArray(data.metrics) ? (data.metrics as ChurnMetric[]) : []
          );
          setSegments(
            Array.isArray(data.segments)
              ? (data.segments as ChurnSegment[])
              : []
          );
          setReasons(
            Array.isArray(data.reasons) ? (data.reasons as ChurnReason[]) : []
          );
          setAtRiskUsers(
            Array.isArray(data.atRiskUsers)
              ? (data.atRiskUsers as AtRiskUser[])
              : []
          );
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

    fetchChurn();
  }, [token, selectedPeriod, appliedFilters]);

  // Fonction d'export
  const handleExport = (format: 'csv' | 'pdf') => {
    const exportData = formatChurnDataForExport({
      metrics: churnMetrics,
      segments,
      reasons,
      atRiskUsers,
    });

    const filename = `churn_${selectedPeriod}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      Object.entries(exportData).forEach(([key, data]) => {
        if (data && data.length > 0) {
          downloadCSV(data, `${filename}_${key}`);
        }
      });
    } else {
      downloadPDF(
        `Analyse du Churn - ${selectedPeriod}`,
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

  const getTrendIcon = (trend: string) => {
    if (trend === "up")
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === "down")
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  const getRiskColor = (risk: string) => {
    if (risk === "high") return "bg-red-100 text-red-800";
    if (risk === "medium") return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "bg-red-100 text-red-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getProgressColor = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio <= 1) return "bg-green-500";
    if (ratio <= 1.5) return "bg-yellow-500";
    return "bg-red-500";
  };

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
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600">{error}</p>
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
                Analyse du Churn
              </h1>
              <p className="text-gray-600">
                Prédiction et prévention de l'attrition des utilisateurs
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {churnMetrics.length} métriques
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {segments.length} segments
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {reasons.length} raisons
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {atRiskUsers.length} utilisateurs à risque
                </Badge>
              </div>
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

        {/* Churn Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {churnMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">
                      {metric.name}
                    </p>
                    <Badge className={getRiskColor(metric.risk)}>
                      {metric.risk}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.name.includes("Temps")
                        ? `${metric.current}j`
                        : `${metric.current}%`}
                    </p>
                    {getTrendIcon(metric.trend)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        Objectif: {metric.target}
                        {metric.name.includes("Temps") ? "j" : "%"}
                      </span>
                      <span>
                        {((metric.current / metric.target) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        (metric.current / metric.target) * 100,
                        100
                      )}
                      className="h-2"
                    />
                  </div>

                  <p className="text-xs text-gray-500">
                    {metric.trend === "down"
                      ? "↓"
                      : metric.trend === "up"
                      ? "↑"
                      : "→"}
                    {Math.abs(metric.current - metric.previous).toFixed(1)}
                    {metric.name.includes("Temps") ? "j" : "%"} vs période
                    précédente
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Churn by Segment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Churn par Segment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Segment</th>
                    <th className="text-center py-3 px-2">Utilisateurs</th>
                    <th className="text-center py-3 px-2">Churned</th>
                    <th className="text-center py-3 px-2">Taux</th>
                    <th className="text-center py-3 px-2">Durée Vie Moy.</th>
                    <th className="text-center py-3 px-2">Impact Revenus</th>
                    <th className="text-center py-3 px-2">Risque</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((segment, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">
                        {segment.segment}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {segment.totalUsers.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {segment.churned.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge
                          className={
                            segment.churnRate >= 20
                              ? "bg-red-100 text-red-800"
                              : segment.churnRate >= 10
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {segment.churnRate}%
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {segment.avgLifetime}j
                      </td>
                      <td className="py-3 px-2 text-center font-medium">
                        {segment.revenueImpact.toLocaleString()} DZD
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={getRiskColor(segment.riskLevel)}>
                          {segment.riskLevel}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Churn Reasons & At Risk Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Raisons du Churn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reasons.map((reason, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {reason.reason}
                        </span>
                        {reason.actionable && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            Actionnable
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {reason.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${reason.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{reason.users} utilisateurs</span>
                      <span>Impact: {reason.impact.toLocaleString()} DZD</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserX className="h-5 w-5 mr-2" />
                Utilisateurs à Risque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atRiskUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserX className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium">Aucun utilisateur à risque détecté</p>
                    <p className="text-sm mt-1">
                      Tous les utilisateurs semblent actifs et engagés
                    </p>
                  </div>
                ) : (
                  atRiskUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <Badge className={getRiskScoreColor(user.riskScore)}>
                          {user.riskScore}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Dernière activité</p>
                          <p className="font-medium">{user.lastActivity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Revenus</p>
                          <p className="font-medium">{user.revenue} DZD</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Churn prédit dans {user.predictedChurn}j</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-red-500 h-1 rounded-full"
                            style={{
                              width: `${100 - user.predictedChurn * 3}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Recommandations d'Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Urgence basée sur les utilisateurs à risque élevé */}
              {atRiskUsers.filter(u => u.riskScore >= 80).length > 0 && (
              <div className="p-4 border rounded-lg bg-red-50">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="font-medium text-red-900">Urgence Élevée</p>
                </div>
                <p className="text-sm text-red-700 mb-3">
                    {atRiskUsers.filter(u => u.riskScore >= 80).length} utilisateur(s) à risque élevé de churn
                </p>
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  Lancer campagne de rétention
                </Button>
              </div>
              )}

              {/* Action préventive basée sur le churn précoce */}
              {churnMetrics.find(m => m.name.includes("Précoce") && m.current > 10) && (
              <div className="p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-center mb-3">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="font-medium text-yellow-900">
                    Action Préventive
                  </p>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                    Churn précoce à {churnMetrics.find(m => m.name.includes("Précoce"))?.current.toFixed(1)}% - Améliorer l'onboarding
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-yellow-600 text-yellow-700"
                >
                  Optimiser onboarding
                </Button>
              </div>
              )}

              {/* Opportunité basée sur le taux de récupération */}
              {churnMetrics.find(m => m.name.includes("Récupération")) && (
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center mb-3">
                  <Target className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="font-medium text-blue-900">Opportunité</p>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                    Taux de récupération: {churnMetrics.find(m => m.name.includes("Récupération"))?.current.toFixed(1)}% - Potentiel d'amélioration
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-600 text-blue-700"
                >
                  Créer campagne win-back
                </Button>
              </div>
              )}

              {/* Message si pas de recommandations urgentes */}
              {atRiskUsers.filter(u => u.riskScore >= 80).length === 0 && 
               !churnMetrics.find(m => m.name.includes("Précoce") && m.current > 10) && (
                <div className="col-span-full p-6 border rounded-lg bg-green-50 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <p className="font-medium text-green-900 mb-2">Situation stable</p>
                  <p className="text-sm text-green-700">
                    Aucune action urgente requise. Continuez à surveiller les métriques.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modaux */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExport}
          title="Exporter l'analyse de churn"
        />

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyFilters}
          title="Filtrer les données de churn"
          filters={[
            {
              id: 'riskLevel',
              label: 'Niveau de risque',
              type: 'select',
              options: [
                { value: 'all', label: 'Tous' },
                { value: 'high', label: 'Élevé' },
                { value: 'medium', label: 'Moyen' },
                { value: 'low', label: 'Faible' },
              ],
            },
            {
              id: 'churnRate',
              label: 'Taux de churn minimum (%)',
              type: 'range',
              min: 0,
              max: 100,
            },
            {
              id: 'segments',
              label: 'Segments',
              type: 'checkbox',
              options: [
                { value: 'newUsers', label: 'Nouveaux utilisateurs' },
                { value: 'active', label: 'Utilisateurs actifs' },
                { value: 'inactive', label: 'Utilisateurs inactifs' },
                { value: 'premium', label: 'Utilisateurs premium' },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}