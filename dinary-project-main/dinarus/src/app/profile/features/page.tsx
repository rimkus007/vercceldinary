'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';

export default function FeaturesPage() {
  // État pour gérer l'affichage du modal de suggestion
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  // État pour gérer le formulaire
  const [suggestion, setSuggestion] = useState('');
  const [category, setCategory] = useState('payment');
  // État pour gérer les retours après soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fonction pour ouvrir le modal
  const openSuggestModal = () => {
    setIsSuggestModalOpen(true);
  };

  // Fonction pour fermer le modal
  const closeSuggestModal = () => {
    // Si le formulaire a été soumis avec succès, on réinitialise tout
    if (isSubmitted) {
      setSuggestion('');
      setCategory('payment');
      setIsSubmitted(false);
    }
    setIsSuggestModalOpen(false);
    setSubmitError('');
  };

  // Fonction pour soumettre la suggestion
  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!suggestion.trim()) {
      setSubmitError('Veuillez entrer une description de votre suggestion.');
      return;
    }
    
    // Simulation d'envoi à une API
    setIsSubmitting(true);
    
    // Simuler un délai d'API
    setTimeout(() => {
      // Simuler une réponse réussie
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // En production, on ferait ici un appel API réel
      
    }, 1000);
  };

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader 
        title="Fonctionnalités" 
        emoji="✨" 
        hasBackButton={true}
        openProfileModalOnBack={true}
      />

      <div className="px-5 py-4">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🚀</span>
              <div>                <h3 className="font-medium mb-1">Découvrez Dinary</h3>
                <p className="text-sm text-gray-600">
                  Explorez toutes les fonctionnalités qui font de Dinary le portefeuille électronique le plus innovant en Algérie.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fonctionnalités principales */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Fonctionnalités principales</h2>
          
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">💸</span>
                </div>
                <div>
                  <p className="font-medium">Transferts instantanés</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Envoyez de l'argent instantanément à vos proches, où qu'ils soient en Algérie.
                  </p>
                  <div className="flex">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">Instantané</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">🎮</span>
                </div>
                <div>
                  <p className="font-medium">Gamification</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Gagnez des points et des badges en utilisant l'application et en atteignant des objectifs financiers.
                  </p>
                  <div className="flex">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2 py-0.5 rounded">Récompenses</span>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded">Défis</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">📱</span>
                </div>
                <div>
                  <p className="font-medium">Paiement par QR code</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Payez rapidement vos achats en magasin en scannant ou en affichant un QR code.
                  </p>
                  <div className="flex">
                    <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2 py-0.5 rounded">Rapide</span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">Sécurisé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fonctionnalités à venir */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Prochainement</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">Nouveautés</span>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-100 border-dashed rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">📚</span>
                </div>
                <div>
                  <p className="font-medium">Dinary Académie</p>
                  <p className="text-sm text-gray-600">
                    Des mini-cours sur plusieurs thématiques : finance, IA, technologies, sciences, investissement, et bien plus encore.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 border-dashed rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">🏪</span>
                </div>
                <div>
                  <p className="font-medium">Marketplace Dinary</p>
                  <p className="text-sm text-gray-600">
                    Achetez directement des produits et services auprès de nos partenaires avec des remises exclusives.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 border-dashed rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-gray-600">
                    Communiquez en temps réel avec notre service client ou vos contacts pour faciliter vos transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bouton pour suggérer une fonctionnalité - Maintenant fonctionnel */}
        <button 
          className="w-full flex items-center justify-center py-3 bg-blue-600 rounded-xl text-white hover:bg-blue-700 active:scale-[0.98] transition-transform"
          onClick={openSuggestModal}
        >
          <span className="font-medium">Suggérer une fonctionnalité</span>
        </button>
      </div>

      {/* Modal pour suggérer une fonctionnalité */}
      {isSuggestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            className="relative bg-white w-full max-w-md rounded-xl shadow-lg p-5 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête du modal */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <span className="mr-2">💡</span>
                {isSubmitted ? 'Suggestion envoyée!' : 'Suggérer une fonctionnalité'}
              </h3>
              <button 
                onClick={closeSuggestModal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <span className="text-gray-500">✕</span>
              </button>
            </div>

            {isSubmitted ? (
              // Message de confirmation après soumission
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl">✓</span>
                </div>
                <h4 className="text-lg font-medium mb-2">Merci pour votre suggestion!</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Nous l'avons bien reçue et nous l'étudierons attentivement.
                </p>
                <button 
                  onClick={closeSuggestModal}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Fermer
                </button>
              </div>
            ) : (
              // Formulaire de suggestion
              <form onSubmit={handleSubmitSuggestion}>
                <div className="mb-4">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select 
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="payment">Paiements</option>
                    <option value="transfer">Transferts</option>
                    <option value="security">Sécurité</option>
                    <option value="rewards">Récompenses</option>
                    <option value="user_experience">Expérience utilisateur</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="suggestion" className="block text-sm font-medium text-gray-700 mb-1">
                    Description de votre suggestion
                  </label>
                  <textarea 
                    id="suggestion"
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder="Décrivez la fonctionnalité que vous aimeriez voir sur Dinary..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32 resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {submitError && (
                    <p className="mt-1 text-sm text-red-600">{submitError}</p>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={closeSuggestModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 mr-3 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center ${
                      isSubmitting ? 'opacity-70' : 'hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                        Envoi...
                      </>
                    ) : 'Envoyer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}