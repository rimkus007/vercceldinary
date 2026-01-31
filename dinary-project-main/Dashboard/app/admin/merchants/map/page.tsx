// app/admin/merchants/map/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Store,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  BellDot,
  Filter,
  Map as MapIcon,
} from "lucide-react";
import MerchantStatCard from "@/components/admin/MerchantStatCard";
import MerchantAnalytics from "@/components/admin/MerchantAnalytics";
import { MERCHANT_CATEGORIES } from "@/types/merchant";
import type { Merchant } from "@/types/merchant";
import type { SuggestedMerchant } from "@/types/suggestion";
import { useAuth } from "@/contexts/AuthContext";

// *** Import correct vers le composant carte ***
const MapWithNoSSR = dynamic(() => import("@/components/admin/MerchantMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      Chargement de la carte...
    </div>
  ),
});

export default function MerchantMapPage() {
  // Liste combinée affichée sur la carte (officiels + suggestions validées)
  const [allMerchantsForMap, setAllMerchantsForMap] = useState<Merchant[]>([]);
  // Suggestions EN ATTENTE (sidebar + icônes ⏳ si tu veux aussi les afficher sur la carte)
  const [pendingSuggestions, setPendingSuggestions] = useState<
    SuggestedMerchant[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carte & recherche dans la zone
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    43.70313, 7.26608,
  ]);
  const [searchAreaCenter, setSearchAreaCenter] = useState<
    [number, number] | null
  >(null);
  const [showSearchButton, setShowSearchButton] = useState(false);

  const { token } = useAuth();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"map" | "analytics">("map");

  // --- Récupération des données (officiels + suggestions) ---
  const fetchMapData = useCallback(
    async (center: [number, number]) => {
      if (!token) return setError("Token administrateur manquant.");
      setLoading(true);
      setError(null);
      setShowSearchButton(false);
      try {
        const [merchantsRes, suggestionsRes, revenueRes] = await Promise.all([
          // 1. Commerçants "officiels"
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/merchants`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // 2. TOUTES les suggestions
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/suggestions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // 3. Revenus réels des commerçants
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/merchants-stats/revenue`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!merchantsRes.ok || !suggestionsRes.ok || !revenueRes.ok)
          throw new Error("Erreur lors du chargement des données.");

        const merchantsData = await merchantsRes.json();
        const suggestionsData = await suggestionsRes.json();
        const revenueData = await revenueRes.json();
        
        /* log removed */
        /* log removed */
        /* log removed */
        
        // Créer un map des revenus par ID de commerçant
        const revenueMap = new Map(
          revenueData.merchants?.map((m: any) => [m.id, m.revenue]) || []
        );

        // 3. Officiels => jamais marqués "suggestion"
        const officialMerchantsData = (
          Array.isArray(merchantsData) ? merchantsData : []
        )
        .filter((m: any) => {
          const hasCoords = m.latitude && m.longitude;
          /* log removed */
          return hasCoords;
        }); // Filtrer seulement ceux avec des coordonnées
        
        // Traiter chaque commerçant avec géocodage asynchrone
        const officialMerchants: Merchant[] = await Promise.all(
          officialMerchantsData.map(async (m: any) => {
          const lat = Number(m.latitude);
          const lng = Number(m.longitude);

          // Normaliser la catégorie
          const categoryId = typeof m?.category === "string"
            ? m.category.toLowerCase().trim()
            : "other";

          // Fonction de géocodage inversé avec cache (utilisée seulement si pas d'adresse)
          const getCityFromCoordinates = async (lat: number, lng: number, address: string): Promise<string> => {
            // D'abord essayer d'extraire depuis l'adresse si disponible
            const fromAddress = extractCityFromAddressFallback(address);
            if (fromAddress && fromAddress !== "Autre") {
              return fromAddress;
            }

            // Sinon, utiliser le géocodage inversé avec cache
            try {
              const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
              const cached = sessionStorage.getItem(`geocode_${cacheKey}`);
              if (cached) return cached;

              // Pour éviter de bloquer le chargement, on retourne "Autre" immédiatement
              // et on fait le géocodage en arrière-plan pour la prochaine fois
              setTimeout(async () => {
                try {
                  const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
                    {
                      headers: {
                        'User-Agent': 'DinaryAdminApp/1.0'
                      }
                    }
                  );
                  if (response.ok) {
                    const data = await response.json();
                    const city = data.address?.city 
                      || data.address?.town 
                      || data.address?.village 
                      || data.address?.state
                      || "Autre";
                    sessionStorage.setItem(`geocode_${cacheKey}`, city);
                  }
                } catch (e) {
                  /* log removed */
                }
              }, Math.random() * 5000); // Délai aléatoire pour éviter de surcharger l'API

              return "Autre";
            } catch (error) {
              return "Autre";
            }
          };

          // Fonction de secours pour extraire la ville depuis l'adresse
          const extractCityFromAddressFallback = (address: string): string => {
            if (!address) return "Autre";
            
            // Liste étendue des villes algériennes (wilayas)
            const algerianCities = [
              'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif', 
              'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'Tiaret', 'Béjaïa', 'Tlemcen', 'Béchar', 
              'Skikda', 'Chlef', 'Bordj Bou Arreridj', 'Bouira', 'Tizi Ouzou', 'Mostaganem',
              'Médéa', 'El Oued', 'Laghouat', 'Ouargla', 'Ghardaïa', 'Mascara', 'Relizane',
              'Khenchela', 'Souk Ahras', 'Saïda', 'Guelma', 'Jijel', 'El Tarf', 'Ain Defla',
              'Tipaza', 'Mila', 'Ain Témouchent', 'Tissemsilt', 'El Bayadh', 'Illizi',
              'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès', 'Timimoun', 'Touggourt',
              'Djanet', 'In Salah', 'In Guezzam', 'Boumerdès', 'Tindouf', 'Naâma', 'Adrar',
              'M\'Sila', 'Oum El Bouaghi', 'Tamanrasset', 'Nice', 'Paris', 'Lyon', 'Marseille',
              'Toulouse', 'Bordeaux', 'Lille', 'Nantes', 'Strasbourg', 'Montpellier', 'Rennes'
            ];
            
            // D'abord chercher si une ville connue est mentionnée
            for (const city of algerianCities) {
              if (address.toLowerCase().includes(city.toLowerCase())) {
                return city;
              }
            }
            
            // Préfixes de rues à ignorer (ne sont pas des villes)
            const streetPrefixes = [
              'rue', 'avenue', 'boulevard', 'allée', 'chemin', 'place', 'square', 
              'impasse', 'cours', 'quai', 'voie', 'passage', 'route', 'av.', 'bd', 
              'bld', 'ave', 'street', 'road'
            ];
            
            // Extraire depuis l'adresse en ignorant les codes postaux et les noms de rues
            const parts = address.split(',').map(p => p.trim());
            for (const part of parts) {
              // Ignorer les codes postaux (nombres de 5 chiffres)
              if (/^\d{5}$/.test(part)) continue;
              // Ignorer les parties trop courtes
              if (part.length < 3) continue;
              // Ignorer les numéros de rue
              if (/^\d+/.test(part)) continue;
              
              // Vérifier si c'est un nom de rue (commence par Avenue, Rue, etc.)
              const lowerPart = part.toLowerCase();
              const isStreet = streetPrefixes.some(prefix => 
                lowerPart.startsWith(prefix + ' ') || lowerPart.startsWith(prefix)
              );
              
              if (isStreet) continue;
              
              // Si c'est une chaîne de texte valide, la retourner
              if (/^[a-zA-Zàâäéèêëïîôùûüÿçæœ\s\-']+$/.test(part)) {
                return part;
              }
            }
            
            return "Autre";
          };

          // Essayer d'abord l'extraction depuis l'adresse, puis géocodage inversé si nécessaire
          const city = await getCityFromCoordinates(lat, lng, m.address ?? "");

          return {
            id: m.id,
            name: m.name,
            address: m.address ?? "",
            category: categoryId,
            isSuggestion: false,
            location: { lat, lng },
            latitude: lat,
            longitude: lng,
            status: (m.status as "active" | "inactive") ?? "active",
            rating: 0,
            tags: [],
            services: [],
            city: city,
            revenue: (revenueMap.get(m.id) as number) ?? 0, // Utiliser les revenus réels
          } as Merchant;
        }));
        
        /* log removed */
        /* log removed */

        // 4. Suggestions APPROUVÉES => ajoutées à la carte avec isSuggestion=true
        const approvedSuggestions: Merchant[] = (
          Array.isArray(suggestionsData) ? suggestionsData : []
        )
          .filter((s: any) => s.status === "approved" && s.latitude && s.longitude)
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            address: s.address ?? "",
            category: typeof s.category === "string" ? s.category.toLowerCase().trim() : "other",
            latitude: s.latitude,
            longitude: s.longitude,
            isSuggestion: true,
            suggestionCode: s.suggestionCode,
            location: { lat: s.latitude, lng: s.longitude },
            status: "active" as const,
            rating: 0,
            tags: [],
            services: [],
            city: s.city ?? null,
            revenue: null,
          }));

        // 5. Combine en une seule liste pour la carte
        const allMerchants = [...officialMerchants, ...approvedSuggestions];
        /* log removed */
        setAllMerchantsForMap(allMerchants);

        // 6. Suggestions EN ATTENTE (sidebar + ⏳)
        const pending = (
          Array.isArray(suggestionsData) ? suggestionsData : []
        ).filter((s: any) => s.status === "pending");
        setPendingSuggestions(pending);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      fetchMapData(mapCenter);
    }
  }, [token, fetchMapData, mapCenter]);

  const handleMapMoveEnd = useCallback((lat: number, lng: number) => {
    // Ne montrer le bouton de recherche que si l'utilisateur a suffisamment déplacé la carte
    const R = 6371000; // Rayon de la Terre en mètres
    const φ1 = (mapCenter[0] * Math.PI) / 180;
    const φ2 = (lat * Math.PI) / 180;
    const Δφ = ((lat - mapCenter[0]) * Math.PI) / 180;
    const Δλ = ((lng - mapCenter[1]) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMoved = R * c; // en mètres

    if (distanceMoved > 100) {
      setSearchAreaCenter([lat, lng]);
      setShowSearchButton(true);
    } else {
      setShowSearchButton(false);
    }
  }, [mapCenter]);

  const handleSearchZone = () => {
    if (searchAreaCenter) {
      setMapCenter(searchAreaCenter);
      fetchMapData(searchAreaCenter);
    }
  };

  // --- Stats & analytics ---
  const mapStats = {
    totalMerchants: allMerchantsForMap.length,
    totalRevenue: allMerchantsForMap.reduce(
      (sum, m) => sum + (m.revenue ?? 0),
      0
    ),
    averageRevenue:
      allMerchantsForMap.length > 0
        ? allMerchantsForMap.reduce((sum, m) => sum + (m.revenue ?? 0), 0) /
          allMerchantsForMap.length
        : 0,
    merchantsByRegion: (() => {
      const getRegion = (m: Merchant) => (m.city as string) || "Autre";
      return allMerchantsForMap.reduce((acc, m) => {
        const region = getRegion(m);
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    })(),
    topCities: (() => {
      const cityCounts: Record<string, number> = {};
      allMerchantsForMap.forEach((m) => {
        const city = (m.city as string) ?? "Autre";
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      });
      return Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([city, count]) => ({ city, count }));
    })(),
  };

  const toggleFilter = (categoryId: string) =>
    setActiveFilters((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MerchantStatCard
          title="Total Commerçants"
          value={mapStats.totalMerchants}
          Icon={Store}
        />
        <MerchantStatCard
          title="Revenus Totaux"
          value={mapStats.totalRevenue}
          Icon={DollarSign}
          format="currency"
        />
        <MerchantStatCard
          title="Revenu Moyen"
          value={mapStats.averageRevenue}
          Icon={TrendingUp}
          format="currency"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-dinary-turquoise focus:border-transparent"
              placeholder="Rechercher un commerçant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("map")}
              className={`flex items-center px-4 py-2 rounded-lg ${
                view === "map"
                  ? "bg-dinary-turquoise text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <MapIcon className="w-5 h-5 mr-2" /> Carte
            </button>
            <button
              onClick={() => setView("analytics")}
              className={`flex items-center px-4 py-2 rounded-lg ${
                view === "analytics"
                  ? "bg-dinary-turquoise text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <TrendingUp className="w-5 h-5 mr-2" /> Analyses
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center mr-2">
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          {MERCHANT_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleFilter(category.id)}
              className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilters.includes(category.id)
                  ? "bg-opacity-100 text-white"
                  : "bg-opacity-10 text-gray-600 hover:bg-opacity-20"
              }`}
              style={{
                backgroundColor: activeFilters.includes(category.id)
                  ? category.color
                  : `${category.color}19`,
              }}
            >
              <span className="mr-2">{category.emoji}</span> {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border">
          {view === "map" ? (
            <div className="h-[600px] relative rounded-lg overflow-hidden">
              <MapWithNoSSR
                merchants={allMerchantsForMap}
                suggestions={pendingSuggestions}
                mapCenter={mapCenter}
                onMoveEnd={handleMapMoveEnd}
                activeFilters={activeFilters}
                searchQuery={searchQuery}
                loading={loading}
              />

              {showSearchButton && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
                  <button
                    onClick={handleSearchZone}
                    className="bg-black text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold flex items-center"
                  >
                    <Search className="w-4 h-4 mr-2" /> Rechercher dans cette
                    zone
                  </button>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-60 z-[999]">
                  <span>Chargement...</span>
                </div>
              )}

              {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg z-[1000]">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <MerchantAnalytics merchants={allMerchantsForMap} />
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Suggestions</h3>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                {pendingSuggestions.length} en attente
              </span>
            </div>
            <div className="space-y-4 max-h-[200px] overflow-y-auto">
              {pendingSuggestions.length > 0 ? (
                pendingSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {suggestion.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {suggestion.address}
                        </p>
                      </div>
                      <BellDot className="w-5 h-5 text-yellow-500" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucune suggestion pour le moment.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold mb-4">
              Distribution par Région
            </h3>
            <div className="space-y-3">
              {Object.entries(mapStats.merchantsByRegion).map(
                ([region, count]) => (
                  <div
                    key={region}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-600">{region}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold mb-4">Top 5 des Villes</h3>
            <div className="space-y-3">
              {mapStats.topCities.map((city, index) => (
                <div
                  key={city.city}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="w-6 text-sm text-gray-500">
                      #{index + 1}
                    </span>
                    <span className="text-gray-600">{city.city}</span>
                  </div>
                  <span className="font-semibold">{city.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
