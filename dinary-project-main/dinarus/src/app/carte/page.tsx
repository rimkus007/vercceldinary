"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/components/layouts/PageHeader";
import PromoBanner from "@/components/common/PromoBanner";
import SuggestCommerceModal, {
  CommerceSubmission,
} from "@/components/modals/SuggestCommerceModal";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// --- Fonction de calcul de distance (Haversine) ---
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // en mètres
  return d;
}

// --- INTERFACES ---
interface Badge {
  id: string;
  label: string;
  emoji: string;
  color: string;
}
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}
export interface Commerce {
  id: string;
  name: string;
  description: string | null;
  category: string;
  address: string | null;
  latitude: number;
  longitude: number;
  distance?: number;
  products?: Product[];
  badges?: Badge[];
  promoActive?: boolean;
  promoValue?: string;
  isSuggestion?: boolean;
  suggestionCode?: string;
}

// --- EMOJIS ---
const CategoryEmojis: Record<string, string> = {
  restaurant: "🍽️",
  groceries: "🥬",
  retail: "🛍️",
  fashion: "👕",
  health: "💊",
  tech: "📱",
  loisirs: "🎮",
  all: "🔍",
  other: "📌",
};

// Mapping pour les noms de catégories affichées
const CategoryNames: Record<string, string> = {
  restaurant: "Restaurant",
  groceries: "Épicerie",
  retail: "Commerce",
  fashion: "Mode",
  health: "Santé",
  tech: "Tech",
  loisirs: "Loisirs",
  all: "Tous",
  other: "Autre",
};

// Couleurs de fond pour les icônes selon la catégorie
const CategoryColors: Record<string, string> = {
  restaurant: "bg-orange-500",
  groceries: "bg-green-500",
  retail: "bg-blue-500",
  fashion: "bg-pink-500",
  health: "bg-red-500",
  tech: "bg-purple-500",
  loisirs: "bg-yellow-500",
  other: "bg-gray-500",
};

// Fonction pour obtenir la couleur de catégorie
const getCategoryColor = (category?: string | null): string => {
  if (!category) return CategoryColors["other"];
  const normalized = category.toLowerCase().trim();
  return CategoryColors[normalized] || CategoryColors["other"];
};

// --- COMPOSANTS INTERNES ---

// --- MODIFIÉ: CommerceItem ---
const CommerceItem = React.memo(
  ({
    commerce,
    onSelect,
    formatDistance,
  }: {
    commerce: Commerce;
    onSelect: (commerce: Commerce) => void;
    formatDistance: (meters?: number) => string;
  }) => (
    <motion.div
      // Style conditionnel bleu
      className={`flex items-center py-3 border-b border-gray-100 cursor-pointer rounded-lg px-2 ${
        commerce.isSuggestion
          ? "bg-blue-50 hover:bg-blue-100"
          : "hover:bg-gray-50"
      }`}
      onClick={() => onSelect(commerce)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        // Couleur icône conditionnelle - bleue pour les suggestions, couleur catégorie pour les officiels
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm mr-4 flex-shrink-0 ${
          commerce.isSuggestion ? "bg-blue-400" : getCategoryColor(commerce.category)
        }`}
      >
        {/* Icône conditionnelle - suggéré ou catégorie */}
        <span className="text-2xl">
          {commerce.isSuggestion
            ? "❓"
            : CategoryEmojis[commerce.category?.toLowerCase()] || CategoryEmojis["other"]}
        </span>
      </div>
      <div className="flex-grow">
        {/* Couleur nom conditionnelle bleue */}
        <h3
          className={`font-semibold ${
            commerce.isSuggestion ? "text-blue-800" : ""
          }`}
        >
          {commerce.name}
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          <span>À {formatDistance(commerce.distance)}</span>
          {commerce.category && (
            <>
              <span className="mx-2">•</span>
              <span className="capitalize">{commerce.category}</span>
            </>
          )}
        </div>
        {/* Message incitation conditionnel bleu */}
        {commerce.isSuggestion && (
          <p className="text-xs text-blue-700 font-medium mt-1">
            Suggéré - Venez me parrainer !
          </p>
        )}
      </div>
    </motion.div>
  )
);
CommerceItem.displayName = "CommerceItem";

const ProductItem = React.memo(({ product }: { product: Product }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
    <div>
      <h4 className="font-medium text-sm">{product.name}</h4>
      {product.description && (
        <p className="text-xs text-gray-500">{product.description}</p>
      )}
    </div>
    <div className="text-right">
      <p className="font-semibold text-sm">{product.price} DA</p>
    </div>
  </div>
));
ProductItem.displayName = "ProductItem";

// --- MODIFIÉ: CommerceDetail ---
const CommerceDetail = ({
  commerce,
  onClose,
}: {
  commerce: Commerce;
  onClose: () => void;
}) => {
  const formatDistance = (meters?: number): string => {
    /* ... (inchangé) ... */
    if (meters === undefined || meters === null) return "? m";
    if (meters < 1000) return `${meters.toFixed(0)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const handleOpenGoogleMaps = () => {
    /* ... (inchangé) ... */
    if (commerce.latitude && commerce.longitude) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${commerce.latitude},${commerce.longitude}`;
      window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("Localisation indisponible.");
    }
  };
  const copySuggestionCode = () => {
    if (commerce.suggestionCode) {
      navigator.clipboard
        .writeText(commerce.suggestionCode)
        .then(() => alert("Code copié dans le presse-papiers !"))
        .catch((err) => void 0);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white w-full max-w-sm mx-auto rounded-2xl p-5 shadow-xl flex flex-col max-h-[90vh] overflow-y-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 flex-shrink-0" />
        <div className="overflow-y-auto flex-grow">
          <div className="flex items-start mb-4">
            <div
              // Couleur icône conditionnelle - bleue pour les suggestions, promo active pour les promotions, couleur catégorie pour les officiels
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm mr-4 flex-shrink-0 ${
                commerce.isSuggestion
                  ? "bg-blue-400"
                  : commerce.promoActive
                  ? "bg-green-600"
                  : getCategoryColor(commerce.category)
              }`}
            >
              {/* Icône conditionnelle - suggéré ou catégorie */}
              <span className="text-2xl">
                {commerce.isSuggestion
                  ? "❓"
                  : (CategoryEmojis[commerce.category?.toLowerCase()] || CategoryEmojis["other"])}
              </span>
            </div>
            <div className="flex-grow">
              {/* Couleur nom conditionnelle bleue */}
              <h2
                className={`font-bold text-xl ${
                  commerce.isSuggestion ? "text-blue-800" : ""
                }`}
              >
                {commerce.name}
              </h2>
              <p className="text-sm text-gray-500">{commerce.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mt-2 -mr-2 rounded-full hover:bg-gray-100 flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {commerce.isSuggestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-blue-800 font-semibold text-lg mb-1">
                ❓ Commerçant suggéré
              </p>
              <p className="text-sm text-blue-700 mb-3">
                {" "}
                {/* ✨ Texte mis à jour ✨ */}
                Ce lieu n'est pas encore partenaire. Partagez le code ci-dessous
                avec le commerçant pour qu'il puisse s'inscrire et vous faire
                gagner une récompense !
              </p>
              {/* ✨ Affichage du code avec bouton copier ✨ */}
              {commerce.suggestionCode ? (
                <div className="flex items-center justify-center space-x-2 bg-white p-2 rounded-lg border border-blue-200">
                  <span className="font-mono font-bold text-blue-900 text-lg tracking-wider">
                    {commerce.suggestionCode}
                  </span>
                  <button
                    onClick={copySuggestionCode}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <p className="text-sm text-red-600">
                  (Code de suggestion indisponible)
                </p>
              )}
              {/* ✨ Lien de parrainage mis à jour ✨ */}
              <Link
                href="/inviter" // Garder ce lien ou ajuster si besoin
                className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Comment parrainer ? (+ récompense)
              </Link>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Distance</p>
              <p className="font-bold">{formatDistance(commerce.distance)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Status</p>
              {/* Statut conditionnel */}
              <p
                className={`font-bold ${
                  commerce.isSuggestion ? "text-gray-500" : "text-green-600"
                }`}
              >
                {commerce.isSuggestion ? "Suggéré" : "Ouvert"}
              </p>
            </div>
          </div>

          {/* Section Produits (masquée si suggestion) */}
          {commerce.products &&
            commerce.products.length > 0 &&
            !commerce.isSuggestion && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">Produits populaires</h3>
                <div className="bg-gray-50 rounded-xl p-4 overflow-y-auto max-h-48">
                  <div className="space-y-2 divide-y divide-gray-100">
                    {commerce.products.map((product) => (
                      <ProductItem key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
        <div className="flex gap-3 pt-4 flex-shrink-0 border-t border-gray-100 mt-auto">
          {/* Bouton "Y aller" conditionnel  et pur copier le code parainnage*/}
          {commerce.isSuggestion && (
            <button
              onClick={copySuggestionCode} // ✨ On peut aussi copier depuis ce bouton
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center"
            >
              <span className="mr-2">📋</span>Copier le Code Suggestion
            </button>
          )}
          {!commerce.isSuggestion && (
            <button
              onClick={handleOpenGoogleMaps}
              className="flex-1 bg-black text-white py-3 rounded-xl font-medium flex items-center justify-center"
            >
              <span className="mr-2">🗺️</span>Y aller
            </button>
          )}
          {/* Bouton "Parrainer" conditionnel bleu */}
          {commerce.isSuggestion && (
            <Link href="/inviter" className="flex-1">
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center">
                <span className="mr-2">🎁</span>Parrainer ce commerçant
              </button>
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const DynamicMap = dynamic(() => import("@/components/common/DynamicMap"), {
  ssr: false,
  loading: () => (
    <div className="relative rounded-xl h-[400px] bg-gray-100 flex items-center justify-center">
      <p>Chargement...</p>
    </div>
  ),
});

// --- PAGE PRINCIPALE ---
export default function CartePage() {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedCommerce, setSelectedCommerce] = useState<Commerce | null>(
    null
  );
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState<boolean>(false);
  const [merchants, setMerchants] = useState<Commerce[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    43.70313, 7.26608,
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [referralReward, setReferralReward] = useState<number>(500);
  const { token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [searchAreaCenter, setSearchAreaCenter] = useState<
    [number, number] | null
  >(null);
  const [showSearchButton, setShowSearchButton] = useState<boolean>(false);
  const initialLoadDone = useRef(false);

  const formatDistance = (meters?: number): string => {
    /* ... (inchangé) ... */
    if (meters === undefined || meters === null) return "? m";
    if (meters < 1000) return `${meters.toFixed(0)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const fetchMerchants = useCallback(
    async (latitude: number, longitude: number) => {
      /* ... (inchangé - utilise /nearby) ... */
      if (!token) return;
      const api = process.env.NEXT_PUBLIC_API_URL;
      if (!api) {
        void 0;
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setShowSearchButton(false);
      try {
        const url = `${api}/merchants/nearby?latitude=${latitude}&longitude=${longitude}&radius=5`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const body = await response.text().catch(() => "");
          void 0;
          setMerchants([]);
          return;
        }
        const data = await response.json();
        const merchantsWithDistance = (Array.isArray(data) ? data : []).map(
          (merchant) => ({
            ...merchant,
            distance: calculateDistance(
              latitude,
              longitude,
              merchant.latitude,
              merchant.longitude
            ),
          })
        );
        setMerchants(merchantsWithDistance);
      } catch (error) {
        void 0;
        setMerchants([]);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    /* ... (inchangé) ... */
    if (token && !initialLoadDone.current) {
      initialLoadDone.current = true;
      const onSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
        fetchMerchants(latitude, longitude);
      };
      const onError = (error: GeolocationPositionError) => {
        void 0;
        fetchMerchants(mapCenter[0], mapCenter[1]);
      };
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 7000,
      });
    }
  }, [token, fetchMerchants, mapCenter]);

  // Récupération du montant de parrainage dynamique
  useEffect(() => {
    const fetchReferralRules = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/referral/rules/USER`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const merchantReferralRule = data.rewards?.find(
            (reward: any) => reward.targetType === "MERCHANT"
          );

          if (merchantReferralRule) {
            setReferralReward(merchantReferralRule.yourReward);
          }
        }
      } catch (error) {
        void 0;
      }
    };

    fetchReferralRules();
  }, [token]);

  const handleSuggestionSubmit = (data: CommerceSubmission) => {
    /* ... (inchangé) ... */
    const submit = async () => {
      if (!token) {
        alert("Connectez-vous.");
        return;
      }
      const api = process.env.NEXT_PUBLIC_API_URL;
      if (!api) {
        void 0;
        setIsSuggestModalOpen(false);
        return;
      }
      try {
        const res = await fetch(`${api}/merchants/suggest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        if (!res.ok) void 0;
      } catch (err) {
        void 0;
      } finally {
        setIsSuggestModalOpen(false);
      }
    };
    submit();
  };

  const handleSearchArea = () => {
    /* ... (inchangé) ... */
    if (searchAreaCenter) {
      setMapCenter(searchAreaCenter);
      fetchMerchants(searchAreaCenter[0], searchAreaCenter[1]);
    }
  };

  const handleMoveEnd = useCallback(
    (lat: number, lng: number) => {
      /* ... (inchangé) ... */
      if (initialLoadDone.current) {
        const distanceMoved = calculateDistance(
          mapCenter[0],
          mapCenter[1],
          lat,
          lng
        );
        if (distanceMoved > 100) {
          setSearchAreaCenter([lat, lng]);
          setShowSearchButton(true);
        } else {
          setShowSearchButton(false);
        }
      }
    },
    [mapCenter]
  );

  const filteredBusinesses = useMemo(() => {
    /* Normaliser les catégories en minuscules pour le filtrage */
    const normalizeCategory = (cat?: string | null): string => {
      if (!cat) return "other";
      return cat.toLowerCase().trim();
    };
    
    const list =
      filterCategory === "all"
        ? merchants
        : merchants.filter((b) => normalizeCategory(b.category) === filterCategory);
    return list.sort((a, b) => {
      if (a.isSuggestion && !b.isSuggestion) return -1;
      if (!a.isSuggestion && b.isSuggestion) return 1;
      return (a.distance ?? Infinity) - (b.distance ?? Infinity);
    });
  }, [merchants, filterCategory]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader
        title="Carte"
        emoji="📍"
      />
      <div className="px-5">
        <div className="my-4">
          <PromoBanner
            title={`+${referralReward.toLocaleString("fr-FR")} DA`}
            description={`Parraine un commerçant et gagne +${referralReward.toLocaleString("fr-FR")} DA`}
            emoji="🎁"
            action={() => router.push("/inviter")}
            actionLabel="Parrainer"
          />
        </div>
        <h2 className="text-xl font-semibold mb-3">Commerçants à proximité</h2>
        <div className="relative">
          {/* Passer les merchants filtrés à DynamicMap */}
          <DynamicMap
            center={mapCenter}
            merchants={filteredBusinesses}
            onMoveEnd={handleMoveEnd}
          />
          <AnimatePresence>
            {showSearchButton && !isSuggestModalOpen && (
              <motion.div
                /* ... (bouton rechercher ici) ... */ className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <button
                  onClick={handleSearchArea}
                  className="bg-black text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5"
                    />
                  </svg>
                  Rechercher ici
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-4">
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
            {Object.entries(CategoryEmojis).map(([category, emoji]) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`flex items-center px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                  filterCategory === category
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="mr-1.5">{emoji}</span>
                <span className="text-sm font-medium">
                  {CategoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2 mb-20">
            {isLoading ? (
              <p className="text-center text-gray-500 py-8">Recherche...</p>
            ) : filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((commerce) => (
                <CommerceItem
                  key={commerce.id}
                  commerce={commerce}
                  onSelect={() => setSelectedCommerce(commerce)}
                  formatDistance={formatDistance}
                />
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">
                  Aucun commerçant trouvé{" "}
                  {filterCategory !== "all"
                    ? `dans la catégorie "${filterCategory}"`
                    : ""}{" "}
                  ici.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="fixed bottom-20 right-5 flex flex-col items-end space-y-3 z-[400]">
        <Link
          href="/suggestions"
          className="bg-white text-black py-2 px-4 rounded-full shadow-md border border-gray-200 flex items-center text-sm font-medium"
        >
          <span className="mr-2">📋</span> Mes suggestions
        </Link>
        <button
          className="bg-black text-white py-3 px-5 rounded-full shadow-lg flex items-center font-semibold"
          onClick={() => setIsSuggestModalOpen(true)}
        >
          <span className="mr-2">➕</span> Suggérer
        </button>
      </div>
      <AnimatePresence>
        {selectedCommerce && (
          <CommerceDetail
            commerce={selectedCommerce}
            onClose={() => setSelectedCommerce(null)}
          />
        )}
      </AnimatePresence>
      <SuggestCommerceModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        onSubmit={handleSuggestionSubmit}
        referralReward={referralReward}
      />
    </div>
  );
}
