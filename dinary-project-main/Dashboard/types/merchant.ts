// types/merchant.ts

export type MerchantCategory = {
  id: string; // identifiant de catégorie (ex: "restaurants")
  name: string; // libellé (ex: "Restaurants")
  emoji: string; // emoji décoratif
  color: string; // couleur hex pour l'UI
};

// Statut tel qu’il ressortait de ton fichier
export type MerchantStatus = "active" | "pending" | "suggested";

export type Merchant = {
  id: string;
  name: string;

  /**
   * Identifiant de catégorie (doit correspondre à MERCHANT_CATEGORIES[].id)
   * ex: "restaurants", "grocery", …
   */
  category: string;

  distance?: number | null; // distance optionnelle (mètres/km selon usage)

  /**
   * Localisation – certaines sources fournissent {lat,lng} imbriqués…
   */
  location?: {
    lat: number;
    lng: number;
  } | null;

  /**
   * … d’autres renvoient latitude/longitude à plat :
   * on les garde optionnels pour compat.
   */
  latitude?: number | null;
  longitude?: number | null;

  address?: string | null;

  status: MerchantStatus;

  /**
   * NEW: flag d'affichage — vrai si ce marchand PROVIENT d'une suggestion validée.
   * (On l’utilise pour l’icône spéciale + le message "Venez me parrainer !")
   */
  isSuggestion?: boolean;

  tags: string[]; // ex: ["halal", "bio"]
  services: string[]; // ex: ["livraison", "retrait"]

  // Métadonnées facultatives (si tu en as besoin plus tard)
  phone?: string | null;
  website?: string | null;
  city?: string | null;
  revenue?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export const MERCHANT_CATEGORIES: MerchantCategory[] = [
  { id: "restaurant", name: "Restaurant", emoji: "🍽️", color: "#f97316" },
  { id: "groceries", name: "Épicerie", emoji: "🥬", color: "#22c55e" },
  { id: "retail", name: "Commerce", emoji: "🛍️", color: "#3b82f6" },
  { id: "fashion", name: "Mode", emoji: "👕", color: "#ec4899" },
  { id: "health", name: "Santé", emoji: "💊", color: "#ef4444" },
  { id: "tech", name: "Tech", emoji: "📱", color: "#9333ea" },
  { id: "loisirs", name: "Loisirs", emoji: "🎮", color: "#eab308" },
  { id: "other", name: "Autre", emoji: "📌", color: "#808080" },
];

/**
 * Récupère l’objet catégorie à partir de son id.
 */
export function getMerchantCategory(id: string): MerchantCategory | undefined {
  return MERCHANT_CATEGORIES.find((c) => c.id === id);
}

/**
 * Normalise la localisation d’un marchand (supporte location.lat/lng OU latitude/longitude).
 * Retourne null si aucune coordonnée exploitable n’est disponible.
 */
export function normalizeMerchantLocation(
  m: Merchant
): { lat: number; lng: number } | null {
  const lat =
    m.location?.lat ??
    (typeof m.latitude === "number" ? m.latitude : undefined);
  const lng =
    m.location?.lng ??
    (typeof m.longitude === "number" ? m.longitude : undefined);

  if (typeof lat === "number" && typeof lng === "number") {
    return { lat, lng };
  }
  return null;
}
