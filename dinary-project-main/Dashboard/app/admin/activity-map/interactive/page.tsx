'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterModal, ExportModal } from '@/components/admin/ActivityMapModals';
import { downloadCSV, downloadPDF } from '@/lib/export-utils';
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Activity,
  Download,
  Filter,
  RefreshCw,
  Zap,
  Target,
  Globe
} from 'lucide-react';

interface RegionData {
  id: string;
  name: string;
  users: number;
  transactions: number;
  revenue: number;
  growth: number;
  activity: 'high' | 'medium' | 'low';
  coordinates: [number, number];
}

interface ActivityHeatmap {
  region: string;
  intensity: number;
  color: string;
  users: number;
  transactions: number;
}

export default function InteractiveMapPage() {
  const { token } = useAuth();
  const [regionsData, setRegionsData] = useState<RegionData[]>([]);
  const [heatmapData, setHeatmapData] = useState<ActivityHeatmap[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [mapView, setMapView] = useState<'activity' | 'revenue' | 'growth'>('activity');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activeRegions: 0
  });

  // États pour les modales
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    if (!token) return;
    fetchMapData();
  }, [token]);

  const fetchMapData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/admin/activity/interactive-map`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la carte');
      }

      const data = await response.json();
      
      setRegionsData(data.regionsData || []);
      setHeatmapData(data.heatmapData || []);
      setSummary(data.summary || { totalUsers: 0, totalTransactions: 0, totalRevenue: 0, activeRegions: 0 });
    } catch (err: any) {
      setError(err.message);
      /* log removed */
    } finally {
      setLoading(false);
    }
  };

  const getActivityColor = (activity: string) => {
    if (activity === 'high') return 'bg-red-100 text-red-800';
    if (activity === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return '#DC2626';
    if (intensity >= 60) return '#EA580C';
    if (intensity >= 40) return '#F59E0B';
    if (intensity >= 20) return '#EAB308';
    return '#22C55E';
  };

  // Appliquer les filtres localement
  const filteredRegions = regionsData.filter(region => {
    if (filters.minUsers && region.users < filters.minUsers) return false;
    if (filters.minTransactions && region.transactions < filters.minTransactions) return false;
    if (filters.minRevenue && region.revenue < filters.minRevenue) return false;
    if (filters.activityLevel && region.activity !== filters.activityLevel) return false;
    return true;
  });

  // Gérer l'export
  const handleExport = (format: 'csv' | 'pdf') => {
    const dataToExport = filteredRegions.map(region => ({
      'Région': region.name,
      'Utilisateurs': region.users,
      'Transactions': region.transactions,
      'Revenus (DZD)': region.revenue,
      'Croissance (%)': region.growth,
      'Activité': region.activity === 'high' ? 'Élevée' : region.activity === 'medium' ? 'Moyenne' : 'Faible',
    }));

    if (format === 'csv') {
      downloadCSV(dataToExport, 'carte-interactive.csv');
    } else {
      downloadPDF(
        'Carte Interactive des Activités',
        { 'Régions': dataToExport },
        'carte-interactive.pdf',
        {
          pageTitle: `Carte des Activités - Algérie`,
          footer: `${filteredRegions.length} régions • ${summary.totalUsers} utilisateurs • ${summary.totalTransactions} transactions`
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dinary-turquoise"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Carte Interactive des Activités</h1>
              <p className="text-gray-600">Visualisation géographique en temps réel de l'activité utilisateur</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={fetchMapData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFilterModalOpen(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="mb-6">
          <div className="flex gap-2">
            {[
              { key: 'activity', label: 'Activité', icon: Activity },
              { key: 'revenue', label: 'Revenus', icon: TrendingUp },
              { key: 'growth', label: 'Croissance', icon: Target }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={mapView === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  /* log removed */
                  setMapView(key as any);
                }}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilisateurs Total</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Données réelles
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-green-600">{summary.totalTransactions.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Backend
                  </p>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus Total</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.totalRevenue.toLocaleString()} DZD</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    En temps réel
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Régions Actives</p>
                  <p className="text-2xl font-bold text-orange-600">{summary.activeRegions}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Actif maintenant
                  </p>
                </div>
                <Globe className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Carte d'Activité - Algérie ({filteredRegions.length} régions)
                  {Object.keys(filters).length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (filtré sur {regionsData.length})
                    </span>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-2">
                  {mapView === 'activity' && 'Taille des points = nombre d\'utilisateurs • Couleur = intensité d\'activité'}
                  {mapView === 'revenue' && 'Taille des points = revenus • Couleur = intensité des revenus'}
                  {mapView === 'growth' && 'Taille des points = taux de croissance • Couleur = intensité de croissance'}
                </p>
              </CardHeader>
              <CardContent>
                {filteredRegions.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {regionsData.length === 0
                        ? 'Aucune donnée géographique disponible'
                        : 'Aucune région ne correspond aux filtres appliqués'}
                    </p>
                  </div>
                ) : (
                  <div className="relative bg-blue-50 rounded-lg p-8 h-96">
                    {/* SVG Map of Algeria with activity indicators */}
                    <svg viewBox="0 0 800 600" className="w-full h-full">
                      {/* Algeria outline - simplified */}
                      <path
                        d="M100 100 L700 100 L700 500 L100 500 Z"
                        fill="#E5E7EB"
                        stroke="#9CA3AF"
                        strokeWidth="2"
                      />
                      
                      {/* Activity Points */}
                      {filteredRegions.map((region, index) => {
                        const x = 150 + (index * 80);
                        const y = 150 + (index % 3) * 100;
                        
                        // Calculer la taille et la couleur selon la vue sélectionnée
                        let size: number;
                        let fillColor: string;
                        
                        if (mapView === 'activity') {
                          size = Math.max(8, (region.users / 1000) * 2);
                          fillColor = getIntensityColor(heatmapData.find(h => h.region === region.name)?.intensity || 0);
                        } else if (mapView === 'revenue') {
                          size = Math.max(8, (region.revenue / 100000) * 2);
                          const maxRevenue = Math.max(...filteredRegions.map(r => r.revenue));
                          const revenueIntensity = Math.round((region.revenue / maxRevenue) * 100);
                          fillColor = getIntensityColor(revenueIntensity);
                        } else { // growth
                          size = Math.max(8, Math.min(30, region.growth * 2));
                          const maxGrowth = Math.max(...filteredRegions.map(r => r.growth));
                          const growthIntensity = Math.round((region.growth / maxGrowth) * 100);
                          fillColor = getIntensityColor(growthIntensity);
                        }
                        
                        return (
                          <g key={region.id}>
                            <circle
                              cx={x}
                              cy={y}
                              r={size}
                              fill={fillColor}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedRegion(region)}
                            />
                            <text
                              x={x}
                              y={y + size + 15}
                              textAnchor="middle"
                              className="text-xs font-medium fill-gray-700"
                            >
                              {region.name}
                            </text>
                            <text
                              x={x}
                              y={y + size + 28}
                              textAnchor="middle"
                              className="text-xs fill-gray-500"
                            >
                              {region.users.toLocaleString()}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                    
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      {mapView === 'activity' ? 'Intensité d\'activité' : 
                       mapView === 'revenue' ? 'Revenus' : 'Croissance'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-600">Faible</span>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-xs text-gray-600">Moyen</span>
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs text-gray-600">Élevé</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

          {/* Region Details */}
          <div id="region-details-panel">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  {selectedRegion ? `Détails - ${selectedRegion.name}` : 'Sélectionnez une région'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRegion ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Utilisateurs</p>
                        <p className="text-lg font-bold text-blue-600">{selectedRegion.users.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Transactions</p>
                        <p className="text-lg font-bold text-green-600">{selectedRegion.transactions.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Revenus</p>
                        <p className="text-lg font-bold text-purple-600">{selectedRegion.revenue.toLocaleString()} DZD</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Croissance</p>
                        <p className="text-lg font-bold text-orange-600">+{selectedRegion.growth}%</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Niveau d'activité</p>
                      <Badge className={getActivityColor(selectedRegion.activity)}>
                        {selectedRegion.activity === 'high' ? 'Élevé' : 
                         selectedRegion.activity === 'medium' ? 'Moyen' : 'Faible'}
                      </Badge>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-2">Métriques clés</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tx par utilisateur</span>
                          <span className="font-medium">{Math.round(selectedRegion.transactions / selectedRegion.users)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Revenu par utilisateur</span>
                          <span className="font-medium">{Math.round(selectedRegion.revenue / selectedRegion.users)} DZD</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Valeur moyenne tx</span>
                          <span className="font-medium">{Math.round(selectedRegion.revenue / selectedRegion.transactions)} DZD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Cliquez sur une région de la carte pour voir les détails</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Regional Performance Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance par Région ({filteredRegions.length})
              {Object.keys(filters).length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (filtré sur {regionsData.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRegions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {regionsData.length === 0
                  ? 'Aucune donnée régionale disponible'
                  : 'Aucune région ne correspond aux filtres appliqués'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Région</th>
                      <th className="text-center py-3 px-2">Utilisateurs</th>
                      <th className="text-center py-3 px-2">Transactions</th>
                      <th className="text-center py-3 px-2">Revenus</th>
                      <th className="text-center py-3 px-2">Croissance</th>
                      <th className="text-center py-3 px-2">Activité</th>
                      <th className="text-center py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegions.map((region, index) => (
                      <tr key={region.id} className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedRegion(region)}>
                        <td className="py-3 px-2 font-medium">{region.name}</td>
                        <td className="py-3 px-2 text-center">{region.users.toLocaleString()}</td>
                        <td className="py-3 px-2 text-center">{region.transactions.toLocaleString()}</td>
                        <td className="py-3 px-2 text-center">{region.revenue.toLocaleString()} DZD</td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center">
                            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                            <span className="text-green-600">+{region.growth}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge className={getActivityColor(region.activity)}>
                            {region.activity === 'high' ? 'Élevé' : 
                             region.activity === 'medium' ? 'Moyen' : 'Faible'}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:bg-dinary-turquoise hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              /* log removed */
                              setSelectedRegion(region);
                              // Scroll vers le panneau de détails
                              setTimeout(() => {
                                const panel = document.getElementById('region-details-panel');
                                if (panel) {
                                  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  // Highlight temporaire
                                  panel.classList.add('ring-2', 'ring-dinary-turquoise', 'ring-offset-2');
                                  setTimeout(() => {
                                    panel.classList.remove('ring-2', 'ring-dinary-turquoise', 'ring-offset-2');
                                  }, 2000);
                                }
                              }, 100);
                            }}
                          >
                            Détails
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modales */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={setFilters}
        />
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExport}
        />
      </div>
    </div>
  );
}
