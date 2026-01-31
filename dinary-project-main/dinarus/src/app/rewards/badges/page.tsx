'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import Link from 'next/link';

// Type pour les badges
interface Badge {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
  earned: boolean;
  date?: string;
  progress?: number;
  total?: number;
  category: string;
}

export default function BadgesPage() {
  // Catégories de badges
  const categories = [
    { id: 'tous', name: 'Tous', icon: '🔍' },
    { id: 'débutant', name: 'Débutant', icon: '🌱' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
    { id: 'parrainage', name: 'Parrainage', icon: '👨‍👩‍👧‍👦' },
    { id: 'transaction', name: 'Transactions', icon: '💸' },
    { id: 'épargne', name: 'Épargne', icon: '💰' }
  ];

  // État pour le filtrage
  const [activeFilter, setActiveFilter] = useState('tous');
  
  // Données des badges (à déplacer vers un contexte ou une API dans une application réelle)
  const [badges, setBadges] = useState<Badge[]>([
    { 
      id: 1, 
      name: "Premier pas", 
      icon: "🚶", 
      color: "bg-blue-100", 
      description: "Effectuer votre première transaction", 
      earned: true, 
      date: "12/05/2025",
      category: "débutant"
    },
    { 
      id: 2, 
      name: "Acheteur régulier", 
      icon: "🛍️", 
      color: "bg-green-100", 
      description: "Réaliser 10 transactions commerciales", 
      earned: true, 
      date: "02/05/2025",
      category: "shopping"
    },
    { 
      id: 3, 
      name: "Super parrain", 
      icon: "👑", 
      color: "bg-purple-100", 
      description: "Parrainer 5 amis qui rejoignent la plateforme", 
      earned: true, 
      date: "30/04/2025",
      category: "parrainage"
    },
    { 
      id: 4, 
      name: "Top commerçant", 
      icon: "🏪", 
      color: "bg-amber-100", 
      description: "Inviter 3 commerçants qui rejoignent la plateforme", 
      earned: false, 
      progress: 1,
      total: 3,
      category: "parrainage"
    },
    { 
      id: 5, 
      name: "Grand dépensier", 
      icon: "💸", 
      color: "bg-pink-100", 
      description: "Dépenser un total de 50 000 DA dans l'application", 
      earned: false,
      progress: 32500,
      total: 50000,
      category: "shopping"
    },
    { 
      id: 6, 
      name: "Économe", 
      icon: "🐖", 
      color: "bg-green-100", 
      description: "Maintenir un solde minimum de 10 000 DA pendant 30 jours", 
      earned: false,
      progress: 12,
      total: 30,
      category: "épargne"
    },
    { 
      id: 7, 
      name: "Ambassadeur", 
      icon: "🌟", 
      color: "bg-yellow-100", 
      description: "Parrainer 10 personnes qui rejoignent la plateforme", 
      earned: false,
      progress: 3,
      total: 10,
      category: "parrainage"
    },
    { 
      id: 8, 
      name: "Explorateur", 
      icon: "🧭", 
      color: "bg-indigo-100", 
      description: "Utiliser toutes les fonctionnalités principales de l'application", 
      earned: true, 
      date: "28/04/2025",
      category: "débutant"
    },
    { 
      id: 9, 
      name: "Transfert expert", 
      icon: "⚡", 
      color: "bg-blue-100", 
      description: "Effectuer 20 transferts instantanés", 
      earned: false,
      progress: 12,
      total: 20,
      category: "transaction"
    },
    { 
      id: 10, 
      name: "Payeur mobile", 
      icon: "📱", 
      color: "bg-cyan-100", 
      description: "Réaliser 15 paiements par QR code", 
      earned: false,
      progress: 8,
      total: 15,
      category: "transaction"
    },
    { 
      id: 11, 
      name: "Épargnant", 
      icon: "🏦", 
      color: "bg-emerald-100", 
      description: "Épargner un total de 20 000 DA", 
      earned: false,
      progress: 12500,
      total: 20000,
      category: "épargne"
    },
    { 
      id: 12, 
      name: "Fidèle", 
      icon: "🔄", 
      color: "bg-violet-100", 
      description: "Utiliser l'application régulièrement pendant 30 jours consécutifs", 
      earned: true, 
      date: "10/05/2025",
      category: "débutant"
    }
  ]);

  // Fonction pour calculer le pourcentage de progression
  const calculateProgress = (progress: number, total: number) => {
    return Math.min(Math.round((progress / total) * 100), 100);
  };

  // Filtrer les badges par catégorie
  const filteredBadges = activeFilter === 'tous'
    ? badges
    : badges.filter(badge => badge.category === activeFilter);

  // Compter les badges par catégorie
  const getBadgeCountByCategory = (category: string) => {
    return category === 'tous' 
      ? badges.length 
      : badges.filter(b => b.category === category).length;
  };

  // Compter les badges obtenus par catégorie
  const getEarnedBadgeCountByCategory = (category: string) => {
    return category === 'tous' 
      ? badges.filter(b => b.earned).length 
      : badges.filter(b => b.category === category && b.earned).length;
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <PageHeader 
        title="Mes badges" 
        emoji="🏅" 
        showBackButton={true}
      />

      {/* En-tête avec statistiques */}
      <div className="px-5">
        <div className="my-4 relative bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-5 rounded-xl overflow-hidden shadow-lg">
          <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-gradient-to-br from-white/20 to-purple-500/10 -mr-20 -mt-20 blur-xl"></div>
          <div className="absolute left-0 bottom-0 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-700/20 to-indigo-800/20 -ml-20 -mb-20 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mr-4">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <p className="text-sm opacity-80">Mes badges</p>
                <h1 className="text-2xl font-bold">{badges.filter(b => b.earned).length} sur {badges.length} obtenus</h1>
              </div>
            </div>

            <div className="mt-4 w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/80 rounded-full"
                style={{ width: `${(badges.filter(b => b.earned).length / badges.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par catégories - Scrollable */}
      <div className="px-5 mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <button 
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`py-2 px-4 rounded-full whitespace-nowrap text-sm font-medium flex items-center ${
                activeFilter === category.id 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span> {category.name}
              <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                {getEarnedBadgeCountByCategory(category.id)}/{getBadgeCountByCategory(category.id)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste des badges */}
      <div className="px-5">
        {filteredBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredBadges.map((badge) => (
              <div 
                key={badge.id} 
                className={`bg-white border border-gray-100 p-4 rounded-xl shadow-sm ${!badge.earned && 'opacity-80'}`}
              >
                <div className="flex items-center mb-3">
                  <div className={`w-12 h-12 rounded-full ${badge.color} flex items-center justify-center text-2xl mr-3`}>
                    <span>{badge.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium">{badge.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badge.earned ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {badge.earned ? 'Obtenu' : 'En cours'}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {badge.description}
                </p>
                
                {!badge.earned && badge.progress !== undefined && badge.total !== undefined && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                      <span>Progression</span>
                      <span>{badge.progress}/{badge.total}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ width: `${calculateProgress(badge.progress, badge.total)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {badge.earned && badge.date && (
                  <p className="text-xs text-gray-400 mt-2">Obtenu le {badge.date}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-lg font-medium mb-1">Aucun badge trouvé</p>
            <p className="text-sm text-gray-500">
              Aucun badge ne correspond à cette catégorie.
            </p>
          </div>
        )}
      </div>
      
      <div className="px-5 mt-6">
        <Link href="/rewards" className="block w-full py-3 border border-gray-200 rounded-xl text-center text-gray-700 text-sm font-medium hover:bg-gray-50 active:scale-[0.98] transition-all">
          Retour aux récompenses
        </Link>
      </div>
    </div>
  );
}