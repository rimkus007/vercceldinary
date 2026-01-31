'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layouts/PageHeader';
import Link from 'next/link';
import { CommerceSubmission } from '@/components/modals/SuggestCommerceModal';
import { useAuth } from '@/context/AuthContext';

// Type étendu pour les suggestions avec leur statut
// Structure de données pour les suggestions retournées par l'API
interface SuggestionWithStatus extends CommerceSubmission {
  id: string;
  status?: string;
  createdAt: string;
  pointsEarned?: number;
}

// Fonction pour obtenir l'émoji correspondant à chaque catégorie
const getCategoryEmoji = (category: string) => {
  const categories: Record<string, string> = {
    restaurant: '🍽️',
    groceries: '🥬',
    retail: '🛍️',
    fashion: '👕',
    health: '💊',
    tech: '📱',
    loisirs: '🎮',
    other: '📌',
  };
  
  return categories[category] || '📌';
};

// Fonction pour obtenir la couleur correspondant à chaque statut
const getStatusColor = (status: string | undefined) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'contacted':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'approved':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'claimed':
    case 'added':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Fonction pour obtenir le libellé correspondant à chaque statut
const getStatusLabel = (status: string | undefined) => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'contacted':
      return 'Contacté';
    case 'approved':
      return 'Approuvé';
    case 'claimed':
      return 'Inscrit ✅';
    case 'added':
      return 'Ajouté';
    case 'rejected':
      return 'Rejeté';
    default:
      return 'Inconnu';
  }
};

export default function SuggestionsHistoryPage() {
  const [suggestions, setSuggestions] = useState<SuggestionWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [referralReward, setReferralReward] = useState<number>(500);
  const router = useRouter();
  const { token } = useAuth();

  // Fonction personnalisée pour gérer le retour vers la page carte
  const handleBackToMap = () => {
    router.push('/carte');
  };

  // Charger le montant de parrainage dynamique
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
        
      }
    };

    fetchReferralRules();
  }, [token]);

  // Charger les suggestions du backend
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!token) {
        setIsLoading(false);
        setSuggestions([]);
        return;
      }
      try {
        const api = process.env.NEXT_PUBLIC_API_URL;
        if (!api) {
          throw new Error('NEXT_PUBLIC_API_URL manquant');
        }
        const res = await fetch(`${api}/merchants/suggestions/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des suggestions');
        }
        const data = await res.json();
        // Assurer la présence de champs attendus
        const mapped: SuggestionWithStatus[] = Array.isArray(data)
          ? data.map((s: any) => ({
              id: s.id,
              name: s.name,
              address: s.address ?? '',
              category: s.category ?? 'other',
              contactName: s.contactName ?? '',
              contactPhone: s.contactPhone ?? '',
              notes: s.notes ?? '',
              status: s.status ?? 'pending',
              createdAt: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            }))
          : [];
        setSuggestions(mapped);
      } catch (error) {
        
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [token]);

  return (
    <div className="bg-white min-h-screen pb-20">
      <PageHeader 
        title="Mes suggestions" 
        emoji="📋" 
        showBackButton={true}
        backTo="/carte"
        onBackClick={handleBackToMap}
      />
      
      <div className="px-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Chargement de vos suggestions...</p>
          </div>
        ) : suggestions.length > 0 ? (
          <>              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
              <div className="flex items-start">
                <span className="text-xl mr-3">💡</span>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">Comment ça fonctionne ?</h3>
                  <p className="text-sm text-blue-800 mb-2">
                    Chaque suggestion que vous faites est examinée par notre équipe. Si le commerçant rejoint Dinary, vous recevrez des points de récompense !
                  </p>
                  <div className="flex items-center bg-yellow-100/50 rounded-lg p-2 mt-1">
                    <span className="text-yellow-600 text-lg mr-2">🎁</span>
                    <p className="text-sm text-yellow-800">
                      <strong className="text-lg text-amber-600">{referralReward.toLocaleString("fr-FR")} DA</strong> par commerçant qui rejoint la plateforme grâce à vous !
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-lg font-semibold mb-4">Historique de vos suggestions</h2>
            
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl mr-3">
                      {getCategoryEmoji(suggestion.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold">{suggestion.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(suggestion.status)}`}>
                          {getStatusLabel(suggestion.status)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{suggestion.address}</p>
                      
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-gray-500">Suggéré le {suggestion.createdAt}</span>
                        
                        {(suggestion.status === 'added' || suggestion.status === 'claimed') && (
                          <span className="ml-3 bg-green-50 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200 flex items-center">
                            <span className="mr-1">🎁</span>
                            +{referralReward.toLocaleString("fr-FR")} DA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4">
              📋
            </div>
            <h2 className="text-xl font-bold mb-2">Aucune suggestion</h2>
            <p className="text-gray-600 mb-5">
              Vous n'avez pas encore suggéré de commerçants à ajouter sur Dinary.
            </p>
            <Link 
              href="/carte" 
              className="bg-black text-white py-3 px-6 rounded-xl font-medium"
            >
              Suggérer un commerçant
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}