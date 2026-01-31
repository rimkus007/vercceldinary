'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LearnRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/learn');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <p className="text-gray-600">Redirection vers la page d'apprentissage...</p>
      </div>
    </div>
  );
}