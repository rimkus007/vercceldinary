'use server';

interface Location {
  address: string;
  city: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface MerchantSuggestion {
  name: string;
  businessType: string;
  location: Location;
  phone: string;
  email: string;
  notes: string;
}

export async function submitMerchantSuggestion(suggestion: MerchantSuggestion) {
  // TODO: Implémenter la logique d'ajout de suggestion
  /* log removed */
  return { success: true };
}

interface SuggestionStatusUpdate {
  id: string;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  notes?: string;
}

export async function updateSuggestionStatus(data: SuggestionStatusUpdate) {
  try {
    // TODO: Implémenter la logique de mise à jour dans la base de données
    /* log removed */
    return { success: true };
  } catch (error) {
    /* log removed */
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

export async function getMerchantSuggestions() {
  try {
    // TODO: Implémenter la logique de récupération depuis la base de données
    return { success: true, data: [] };
  } catch (error) {
    /* log removed */
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}
