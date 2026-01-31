// Fichier : src/app/boutique/emplacement/page.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layouts/PageHeader";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";

const LocationSetter = dynamic(
  () => import("@/components/common/LocationSetter"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
        <p>Chargement de la carte...</p>
      </div>
    ),
  }
);

export default function EmplacementPage() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addressPreview, setAddressPreview] = useState(
    "Détection de l'adresse..."
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { token, refreshUser } = useAuth(); // ✅ On récupère refreshUser
  const router = useRouter();
  const geocodeTimer = useRef<NodeJS.Timeout | null>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  // Géolocalisation initiale
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const initialPos: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(initialPos);
        reverseGeocode(initialPos[0], initialPos[1]); // On cherche l'adresse initiale
      },
      () => {
        setPosition([43.70313, 7.26608]); // Fallback sur Nice
      }
    );
  }, []);

  // Fonction pour convertir les coordonnées en adresse (pour l'aperçu)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
      );
      if (!response.ok) return;
      const data = await response.json();
      // Nominatim renvoie l'adresse complète via display_name. On la tronque pour éviter les adresses trop longues.
      const full = data.display_name || '';
      if (full) {
        const parts = full.split(',').map((s: string) => s.trim());
        // Garder seulement les 3 premières parties de l'adresse pour plus de lisibilité
        const trimmed = parts.slice(0, 3).join(', ');
        setAddressPreview(trimmed);
      } else {
        setAddressPreview('Adresse non trouvée');
      }
    } catch (error) {
      setAddressPreview("Impossible de récupérer l'adresse");
    }
  };

  const handlePositionChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    // On attend un peu avant de chercher l'adresse pour ne pas surcharger l'API
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, 500); // Délai de 500ms
  };

  // Fonction pour rechercher une adresse
  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=fr&countrycodes=dz,fr`
      );
      if (!response.ok) return;
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      void 0;
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Gérer le changement de la barre de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Délai avant la recherche pour éviter trop de requêtes
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  // Sélectionner un résultat de recherche
  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPosition([lat, lng]);
    setAddressPreview(result.display_name.split(',').slice(0, 3).join(', '));
    setSearchQuery(result.display_name.split(',').slice(0, 3).join(', '));
    setShowResults(false);
  };

  const handleSaveLocation = async () => {
    if (!position || !token) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/me/location`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            latitude: position[0],
            longitude: position[1],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("La sauvegarde a échoué.");
      }

      // ✅ LA CORRECTION MAGIQUE EST ICI !
      await refreshUser(); // On actualise les données du marchand dans toute l'app

      setTimeout(() => router.push("/boutique"), 1500);
    } catch (err) {
      // Gérer l'erreur
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen mb-16">
      <PageHeader
        title="Mon Emplacement"
        emoji="📍"
        hasBackButton={true}
        backTo="/boutique"
      />
      <div className="px-5 py-4">
        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-2xl p-5 mb-6 shadow-lg">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span>Définissez votre position</span>
          </h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            Recherchez votre adresse ou faites glisser le marqueur pour indiquer l'emplacement exact de votre commerce.
          </p>
        </div>

        {/* Barre de recherche d'adresse */}
        <div className="mb-6 relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="🔍 Rechercher une adresse (ex: 44 Av. Jean Médecin, Nice)..."
              className="w-full px-4 py-4 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm text-sm"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Résultats de recherche */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-64 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => selectSearchResult(result)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">📍</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {result.display_name.split(',').slice(0, 2).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {result.display_name.split(',').slice(2, 4).join(', ')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Carte */}
        <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white">
          {position ? (
            <LocationSetter
              initialPosition={position}
              onPositionChange={handlePositionChange}
            />
          ) : (
            <div className="h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                <p className="text-gray-600 font-medium">Détection de votre position...</p>
              </div>
            </div>
          )}
        </div>

        {/* Aperçu de l'adresse */}
        <div className="mt-5 bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📌</span>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Aperçu de l'adresse</p>
          </div>
          <p className="text-base font-bold text-gray-900 leading-relaxed">{addressPreview}</p>
        </div>

        {/* Bouton de sauvegarde */}
        <button
          onClick={handleSaveLocation}
          disabled={isLoading || !position}
          className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Enregistrer mon emplacement</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
