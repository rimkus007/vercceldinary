// components/admin/MerchantMap.tsx
"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Correction pour l'icône par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Catégories de commerçants avec emojis et couleurs
// Correspond aux catégories de la base de données
const MERCHANT_CATEGORIES = [
  { id: "restaurant", emoji: "🍽️", color: "#f97316" }, // orange
  { id: "groceries", emoji: "🥬", color: "#22c55e" },  // green
  { id: "retail", emoji: "🛍️", color: "#3b82f6" },    // blue
  { id: "fashion", emoji: "👕", color: "#ec4899" },     // pink
  { id: "health", emoji: "💊", color: "#ef4444" },     // red
  { id: "tech", emoji: "📱", color: "#9333ea" },       // purple
  { id: "loisirs", emoji: "🎮", color: "#eab308" },     // yellow
  { id: "other", emoji: "📌", color: "#808080" },       // gray
];

// Créer des icônes personnalisées
const createEmojiIcon = (emoji: string, color: string) =>
  L.divIcon({
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:36px;height:36px;border-radius:50%;
      background:${color};border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.2);
      font-size:18px;line-height:1;">${emoji}</div>`,
    className: "emoji-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

// Icône spéciale pour les commerçants suggérés
const suggestedApprovedIcon = createEmojiIcon("❓", "#3B82F6");

// Types
interface MerchantMapProps {
  merchants: any[];
  suggestions?: any[];
  mapCenter: [number, number];
  onMoveEnd?: (lat: number, lng: number) => void;
  activeFilters?: string[];
  searchQuery?: string;
  loading?: boolean;
}

const MerchantMap: React.FC<MerchantMapProps> = ({
  merchants = [],
  suggestions = [],
  mapCenter,
  onMoveEnd,
  activeFilters = [],
  searchQuery = "",
  loading = false,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onMoveEndRef = useRef(onMoveEnd);
  const isInitialMount = useRef(true);
  onMoveEndRef.current = onMoveEnd;

  // Effet pour initialiser la carte UNE SEULE FOIS
  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const map = L.map(containerRef.current, {
        center: mapCenter,
        zoom: 13,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on("moveend", () => {
        const mapCenter = map.getCenter();
        onMoveEndRef.current?.(mapCenter.lat, mapCenter.lng);
      });

      mapRef.current = map;
      isInitialMount.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Tableau de dépendances vide pour ne s'exécuter qu'une fois

  // Effet pour recentrer la carte quand la prop 'center' change
  // Mais seulement après le montage initial, et sans changer le zoom
  useEffect(() => {
    if (mapRef.current && !isInitialMount.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setView(mapCenter, currentZoom);
    }
  }, [mapCenter]);

  // Fonction pour obtenir l'icône de catégorie
  const getCategoryIcon = (category?: string | null) => {
    if (!category) {
      const other = MERCHANT_CATEGORIES.find((c) => c.id === "other")!;
      return createEmojiIcon(other.emoji, other.color);
    }
    
    // Normaliser la catégorie en minuscules pour la recherche
    const normalizedCategory = category.toLowerCase().trim();
    const cat =
      MERCHANT_CATEGORIES.find((c) => c.id === normalizedCategory) ||
      MERCHANT_CATEGORIES.find((c) => c.id === "other")!;
    return createEmojiIcon(cat.emoji, cat.color);
  };

  // Filtrer les marchands
  const filteredMerchants = React.useMemo(() => {
    /* log removed */
    
    const filtered = merchants.filter((m) => {
      // Normaliser la catégorie pour la comparaison
      const normalizedCategory = m.category ? m.category.toLowerCase().trim() : "other";
      
      const okFilter =
        activeFilters.length === 0 || activeFilters.includes(normalizedCategory);
      const okSearch =
        !searchQuery ||
        (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!okFilter && activeFilters.length > 0) {
        /* log removed */
      }
      
      return okFilter && okSearch;
    });
    
    /* log removed */
    return filtered;
  }, [merchants, activeFilters, searchQuery]);

  // Effet pour mettre à jour les marqueurs
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current?.removeLayer(layer);
        }
      });

      // Mapping des noms de catégories en français
      const categoryNames: Record<string, string> = {
        restaurant: "Restaurant",
        groceries: "Épicerie",
        retail: "Commerce",
        fashion: "Mode",
        health: "Santé",
        tech: "Tech",
        loisirs: "Loisirs",
        other: "Autre",
      };

      filteredMerchants.forEach((merchant) => {
        // Trouver les coordonnées
        const latitude = merchant.latitude || merchant.location?.lat || merchant.lat;
        const longitude = merchant.longitude || merchant.location?.lng || merchant.lng;

        if (typeof latitude === "number" && typeof longitude === "number") {
          const icon = merchant.isSuggestion
            ? suggestedApprovedIcon
            : getCategoryIcon(merchant.category);

          const marker = L.marker([latitude, longitude], {
            icon,
          }).addTo(mapRef.current!);

          const categoryDisplayName = merchant.category 
            ? (categoryNames[merchant.category.toLowerCase().trim()] || merchant.category)
            : "Autre";

          // Créer le contenu du popup
          let popupContent = `<div style="padding: 8px; font-family: sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${
              merchant.name || "Sans nom"
            }</h3>
            ${merchant.address ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${merchant.address}</p>` : ""}
            <p style="margin: 0 0 8px 0; color: #888; font-size: 12px;">Catégorie: ${categoryDisplayName}</p>`;

          // Ajouter un message spécial ET LE CODE pour les commerçants suggérés
          if (merchant.isSuggestion && merchant.suggestionCode) {
            popupContent += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
              <p style="margin: 0 0 4px 0; font-weight: bold; color: #3B82F6; font-size: 14px;">
                ❓ Venez me parrainer !
              </p>
              <p style="margin: 0; font-size: 12px; color: #333;">Code Suggestion: <strong style="color: #000; font-size: 13px;">${merchant.suggestionCode}</strong></p>
            </div>`;
          } else if (merchant.isSuggestion) {
            popupContent += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
              <p style="margin: 0; font-weight: bold; color: #3B82F6; font-size: 14px;">
                ❓ Venez me parrainer ! (Code indisponible)
              </p>
            </div>`;
          }

          popupContent += `</div>`;
          marker.bindPopup(popupContent);
        }
      });

      // Afficher les suggestions en attente si nécessaire
      suggestions.forEach((s: any) => {
        const lat = s?.location?.lat || s?.latitude;
        const lng = s?.location?.lng || s?.longitude;
        
        if (typeof lat === "number" && typeof lng === "number") {
          const pendingIcon = L.divIcon({
            html: `<div style="
              display:flex;align-items:center;justify-content:center;
              width:30px;height:30px;border-radius:50%;
              background:#94a3b8;border:2px dashed #e5e7eb;box-shadow:0 2px 4px rgba(0,0,0,.15);
              font-size:16px;line-height:1;">⏳</div>`,
            className: "pending-marker",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          const marker = L.marker([lat, lng], {
            icon: pendingIcon,
          }).addTo(mapRef.current!);

          let popupContent = `<div style="padding: 8px; font-family: sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${s.name || "Sans nom"}</h3>
            <p style="margin: 0 0 8px 0; color: #888; font-size: 12px;">⏳ Suggestion en attente de validation</p>
            ${s.address ? `<p style="margin: 0; font-size: 12px; color: #666;">${s.address}</p>` : ""}
          </div>`;

          marker.bindPopup(popupContent);
        }
      });
    }
  }, [filteredMerchants, suggestions, getCategoryIcon]);

          return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "12px",
        zIndex: 0,
      }}
    />
  );
};

export default MerchantMap;
