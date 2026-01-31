import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Le middleware est désormais simplifié car l'authentification est gérée par le contexte
// L'AuthContext redirige automatiquement vers http://localhost:3000/login si non authentifié
export async function middleware(request: NextRequest) {
  // Le middleware ne fait plus de vérification d'authentification
  // Toute la logique est déléguée à l'AuthContext qui gère les redirections
  return NextResponse.next();
}

// Configurer les routes sur lesquelles le middleware doit s'exécuter
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
