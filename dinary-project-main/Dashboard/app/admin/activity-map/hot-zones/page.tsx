'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterModal, ExportModal } from '@/components/admin/ActivityMapModals';
import { downloadCSV, downloadPDF } from '@/lib/export-utils';
import { 
  Flame, 
  TrendingUp, 
  MapPin,
  Clock,
  Users,
  Zap,
  Download,
  Filter,
  AlertTriangle,
  Star,
  Target,
  Timer
} from 'lucide-react';

interface HotZone {
  id: string;
  name: string;
  location: string;
  intensity: number;
  users: number;
  transactions: number;
  revenue: number;
  growth: number;
  peakHours: string;
  duration: number;
  trend: 'up' | 'down' | 'stable';
  risk: 'low' | 'medium' | 'high';
}

interface TimeSlot {
  hour: string;
  activity: number;
  zones: number;
  peak: boolean;
}

interface ActivityAlert {
  id: string;
  zone: string;
  type: 'spike' | 'drop' | 'anomaly';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  actions: string[];
}

export default function HotZonesPage() {
  const { token } = useAuth();
  const [hotZones, setHotZones] = useState<HotZone[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [alerts, setAlerts] = useState<ActivityAlert[]>([]);
  const [selectedZone, setSelectedZone] = useState<HotZone | null>(null);
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    activeZones: 0,
    averageIntensity: 0,
    averageDuration: '0',
    alertsCount: 0
  });
  
  // États pour les modales
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    if (!token) return;
    fetchHotZones();
  }, [token, timeRange]);

  const fetchHotZones = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = `${baseUrl}/admin/activity/hot-zones${timeRange ? `?timeRange=${timeRange}` : ''}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des zones chaudes');
      }

      const data = await response.json();
      
      setHotZones(data.hotZones || []);
      setTimeSlots(data.timeSlots || []);
      setAlerts(data.alerts || []);
      setSummary(data.summary || { activeZones: 0, averageIntensity: 0, averageDuration: '0', alertsCount: 0 });
    } catch (err: any) {
      setError(err.message);
      /* log removed */
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 90) return 'bg-red-500';
    if (intensity >= 75) return 'bg-orange-500';
    if (intensity >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'high') return 'bg-red-100 text-red-800';
    if (risk === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-100 text-red-800';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  // Appliquer les filtres localement
  const filteredHotZones = hotZones.filter(zone => {
    if (filters.minUsers && zone.users < filters.minUsers) return false;
    if (filters.minTransactions && zone.transactions < filters.minTransactions) return false;
    if (filters.minRevenue && zone.revenue < filters.minRevenue) return false;
    return true;
  });

  // Gérer l'export
  const handleExport = (format: 'csv' | 'pdf') => {
    const dataToExport = filteredHotZones.map(zone => ({
      'Zone': zone.name,
      'Localisation': zone.location,
      'Intensité (%)': zone.intensity,
      'Utilisateurs': zone.users,
      'Transactions': zone.transactions,
      'Revenus (DZD)': zone.revenue,
      'Croissance (%)': zone.growth,
      'Heures de pic': zone.peakHours,
      'Durée (h)': zone.duration,
      'Tendance': zone.trend === 'up' ? 'Hausse' : zone.trend === 'down' ? 'Baisse' : 'Stable',
      'Risque': zone.risk === 'high' ? 'Élevé' : zone.risk === 'medium' ? 'Moyen' : 'Faible',
    }));

    if (format === 'csv') {
      downloadCSV(dataToExport, 'zones-chaudes.csv');
    } else {
      downloadPDF(
        'Zones d\'Activité Intense',
        { 'Zones Chaudes': dataToExport },
        'zones-chaudes.pdf',
        {
          pageTitle: `Période: ${timeRange}`,
          footer: `${filteredHotZones.length} zones • Intensité moyenne: ${summary.averageIntensity}%`
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Zones d'Activité Intense</h1>
              <p className="text-gray-600">Détection et analyse des pics d'activité géographiques</p>
            </div>
            <div className="flex gap-3">
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

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex gap-2">
            {['1h', '6h', '24h', '7d', '30d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Zones Actives</p>
                  <p className="text-2xl font-bold text-red-600">{summary.activeZones}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Données réelles
                  </p>
                </div>
                <Flame className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Intensité Moyenne</p>
                  <p className="text-2xl font-bold text-orange-600">{summary.averageIntensity}%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    En temps réel
                  </p>
                </div>
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Durée Moyenne Pic</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.averageDuration}h</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Backend
                  </p>
                </div>
                <Timer className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alertes Actives</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.alertsCount}</p>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {alerts.filter(a => a.severity === 'high').length} haute priorité
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Activité par Heure
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeSlots.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune donnée d'activité horaire disponible</p>
              ) : (
                <div className="space-y-4">
                  {timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 text-sm font-medium text-gray-600">
                        {slot.hour}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">Activité: {slot.activity}%</span>
                          <span className="text-sm text-gray-500">{slot.zones} zones</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              slot.peak ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${slot.activity}%` }}
                          ></div>
                        </div>
                      </div>
                      {slot.peak && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-xs text-yellow-600 ml-1">Pic</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alertes Actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune alerte active</p>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-1">{alert.zone}</h4>
                      <p className="text-sm text-gray-600 mb-3">{alert.message}</p>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700">Actions recommandées:</p>
                        {alert.actions.map((action, idx) => (
                          <p key={idx} className="text-xs text-gray-600">• {action}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hot Zones List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flame className="h-5 w-5 mr-2" />
              Zones d'Activité Intense ({filteredHotZones.length})
              {Object.keys(filters).length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (filtré sur {hotZones.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredHotZones.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {hotZones.length === 0 
                  ? 'Aucune zone d\'activité intense détectée' 
                  : 'Aucune zone ne correspond aux filtres appliqués'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHotZones.map((zone) => (
                  <div key={zone.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => setSelectedZone(zone)}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{zone.name}</h3>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(zone.trend)}
                        <Badge className={getRiskColor(zone.risk)}>
                          {zone.risk}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{zone.location}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Intensité</span>
                          <span className="font-medium">{zone.intensity}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getIntensityColor(zone.intensity)}`}
                            style={{ width: `${zone.intensity}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Utilisateurs</p>
                          <p className="font-medium">{zone.users.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Revenus</p>
                          <p className="font-medium">{zone.revenue.toLocaleString()} DZD</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Pic d'activité</p>
                          <p className="font-medium">{zone.peakHours}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Durée</p>
                          <p className="font-medium">{zone.duration}h</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-gray-500">Croissance</span>
                        <span className={`text-sm font-medium ${
                          zone.growth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {zone.growth > 0 ? '+' : ''}{zone.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zone Details Modal */}
        {selectedZone && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{selectedZone.name}</h2>
                <Button variant="outline" size="sm" onClick={() => setSelectedZone(null)}>
                  Fermer
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Localisation</p>
                    <p className="font-medium">{selectedZone.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Intensité</p>
                    <p className="font-medium">{selectedZone.intensity}%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Utilisateurs</p>
                    <p className="font-medium">{selectedZone.users.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transactions</p>
                    <p className="font-medium">{selectedZone.transactions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revenus</p>
                    <p className="font-medium">{selectedZone.revenue.toLocaleString()} DZD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
