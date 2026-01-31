"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  CreditCard,
  Download,
  Filter,
  Zap,
  ArrowRight,
  Timer,
} from "lucide-react";
import ExportModal from "@/components/admin/ExportModal";
import FunnelDetailModal from "@/components/admin/FunnelDetailModal";
import FilterModal from "@/components/admin/FilterModal";
import {
  formatConversionDataForExport,
  downloadCSV,
  downloadPDF,
} from "@/lib/export-utils";

interface ConversionFunnel {
  stage: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
  icon: React.ReactNode;
}

interface ConversionMetric {
  name: string;
  current: number;
  previous: number;
  target: number;
  trend: "up" | "down" | "stable";
}

interface ConversionSegment {
  segment: string;
  users: number;
  conversions: number;
  rate: number;
  revenue: number;
}

export default function ConversionAnalysisPage() {
  const [funnelData, setFunnelData] = useState<ConversionFunnel[]>([]);
  const [metrics, setMetrics] = useState<ConversionMetric[]>([]);
  const [segments, setSegments] = useState<ConversionSegment[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30d");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  
  // États pour les modaux
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<number | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const getStageIcon = (stage: string) => {
    const key = stage.toLowerCase();
    if (key.includes("inscription")) return <Users className="h-6 w-6 text-blue-600" />;
    if (key.includes("premiere")) return <ShoppingCart className="h-6 w-6 text-green-600" />;
    if (key.includes("recurrente") || key.includes("recurrent")) return <CreditCard className="h-6 w-6 text-purple-600" />;
    if (key.includes("fidele") || key.includes("fideles")) return <Target className="h-6 w-6 text-indigo-600" />;
    return <Zap className="h-6 w-6 text-orange-500" />;
  };


  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      try {
        // Construire l'URL avec les paramètres
        const url = new URL(`${baseUrl}/admin/stats/conversion`);
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
          throw new Error("Impossible de récupérer les données de conversion.");
        }

        const data = await response.json();

        // Log pour débogage - voir ce que le backend retourne
        /* log removed */

        // Le backend retourne { funnel, metrics, segments }
        setMetrics(
          Array.isArray(data.metrics) ? (data.metrics as ConversionMetric[]) : []
        );
        const mapped = Array.isArray(data.funnel)
          ? (data.funnel as Array<Record<string, any>>).map((stage) => ({
              stage: stage.stage,
              users: stage.users,
              conversionRate: stage.conversionRate,
              dropOffRate: stage.dropOffRate,
              icon: getStageIcon(stage.stage ?? ""),
            }))
          : [];
        setFunnelData(mapped as ConversionFunnel[]);
        setSegments(
          Array.isArray(data.segments)
            ? (data.segments as ConversionSegment[])
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

    fetchStats();
  }, [token, selectedPeriod, appliedFilters]);

  // Fonction d'export
  const handleExport = (format: 'csv' | 'pdf') => {
    const exportData = formatConversionDataForExport({
      metrics,
      funnel: funnelData.map(f => ({
        stage: f.stage,
        users: f.users,
        conversionRate: f.conversionRate,
        dropOffRate: f.dropOffRate,
      })),
      segments,
    });

    const filename = `conversion_${selectedPeriod}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      // Exporter chaque section dans un fichier CSV séparé
      Object.entries(exportData).forEach(([key, data]) => {
        if (data && data.length > 0) {
          downloadCSV(data, `${filename}_${key}`);
        }
      });
    } else {
      // Exporter en PDF
      downloadPDF(
        `Analyse des Conversions - ${selectedPeriod}`,
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
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (trend === "down")
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-600";
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 30) return "bg-green-500";
    if (rate >= 20) return "bg-yellow-500";
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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Analyse des Conversions
          </h1>
          <p className="text-red-600 mb-4">{error}</p>
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
                Analyse des Conversions
              </h1>
              <p className="text-gray-600">
                Optimisation du parcours utilisateur et taux de conversion
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {metrics.length} métriques
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {funnelData.length} étapes
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {segments.length} segments
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

        {/* Conversion Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">
                      {metric.name}
                    </p>
                    {getTrendIcon(metric.trend)}
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.name.includes("Temps")
                        ? `${metric.current}j`
                        : metric.name.includes("Valeur")
                        ? `${metric.current} DZD`
                        : `${metric.current}%`}
                    </p>
                    <div className="flex items-center mt-2">
                      <p className={`text-xs ${getTrendColor(metric.trend)}`}>
                        {metric.trend === "up"
                          ? "+"
                          : metric.trend === "down"
                          ? "-"
                          : ""}
                        {Math.abs(metric.current - metric.previous).toFixed(1)}
                        {metric.name.includes("Temps")
                          ? "j"
                          : metric.name.includes("Valeur")
                          ? " DZD"
                          : "%"}{" "}
                        vs précédent
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>
                        Objectif: {metric.target}
                        {metric.name.includes("Temps")
                          ? "j"
                          : metric.name.includes("Valeur")
                          ? " DZD"
                          : "%"}
                      </span>
                      <span>
                        {((metric.current / metric.target) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={(metric.current / metric.target) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conversion Funnel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Entonnoir de Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={index} className="relative">
                  <div 
                    className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                    onClick={() => setSelectedFunnelStage(index)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {stage.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {stage.stage}
                        </p>
                        <p className="text-sm text-gray-500">
                          {stage.users.toLocaleString()} utilisateurs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {stage.conversionRate}%
                        </p>
                        <p className="text-xs text-gray-500">Conversion</p>
                      </div>

                      {stage.dropOffRate > 0 && (
                        <div className="text-center">
                          <p className="text-lg font-medium text-red-600">
                            -{stage.dropOffRate}%
                          </p>
                          <p className="text-xs text-gray-500">Abandon</p>
                        </div>
                      )}

                      {index < funnelData.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFunnelStage(index);
                          }}
                          className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                          title="Voir les détails"
                        >
                          <ArrowRight className="h-5 w-5 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar between stages */}
                  {index < funnelData.length - 1 && (
                    <div className="mt-2 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getConversionColor(
                            funnelData[index + 1].conversionRate
                          )}`}
                          style={{
                            width: `${funnelData[index + 1].conversionRate}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Segment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Analyse par Segment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Segment</th>
                    <th className="text-center py-3 px-2">Utilisateurs</th>
                    <th className="text-center py-3 px-2">Conversions</th>
                    <th className="text-center py-3 px-2">Taux</th>
                    <th className="text-center py-3 px-2">Revenus</th>
                    <th className="text-center py-3 px-2">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((segment, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">
                        {segment.segment}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {segment.users.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {segment.conversions.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge
                          className={
                            segment.rate >= 30
                              ? "bg-green-100 text-green-800"
                              : segment.rate >= 20
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {segment.rate}%
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center font-medium">
                        {segment.revenue.toLocaleString()} DZD
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getConversionColor(
                              segment.rate
                            )}`}
                            style={{
                              width: `${Math.min(segment.rate * 2, 100)}%`,
                            }}
                          ></div>
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
          title="Exporter l'analyse de conversion"
        />

        <FunnelDetailModal
          isOpen={selectedFunnelStage !== null}
          onClose={() => setSelectedFunnelStage(null)}
          stage={selectedFunnelStage !== null ? funnelData[selectedFunnelStage] : null}
          previousStage={selectedFunnelStage !== null && selectedFunnelStage > 0 ? funnelData[selectedFunnelStage - 1] : null}
          nextStage={selectedFunnelStage !== null && selectedFunnelStage < funnelData.length - 1 ? funnelData[selectedFunnelStage + 1] : null}
        />

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyFilters}
          title="Filtrer les données de conversion"
          filters={[
            {
              id: 'userType',
              label: 'Type d\'utilisateur',
              type: 'select',
              options: [
                { value: 'all', label: 'Tous' },
                { value: 'new', label: 'Nouveaux' },
                { value: 'active', label: 'Actifs' },
                { value: 'recurring', label: 'Récurrents' },
              ],
            },
            {
              id: 'conversionRate',
              label: 'Taux de conversion minimum (%)',
              type: 'range',
              min: 0,
              max: 100,
            },
            {
              id: 'segments',
              label: 'Segments',
              type: 'checkbox',
              options: [
                { value: 'nouveaux', label: 'Nouveaux utilisateurs' },
                { value: 'actifs', label: 'Utilisateurs actifs' },
                { value: 'recurrents', label: 'Utilisateurs récurrents' },
                { value: 'referres', label: 'Parrainages' },
                { value: 'merchants', label: 'Commerçants' },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}
