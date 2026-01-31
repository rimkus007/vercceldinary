// Configuration centralisée de l'API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fonction utilitaire pour les appels API avec authentification
export const apiFetch = async (url: string, options: RequestInit = {}, token?: string) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });
};
