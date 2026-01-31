'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Logique pour soumettre le feedback
  };
  
  if (submitted) {
    return (
      <div className="bg-white min-h-screen mb-16">
        <PageHeader 
          title="Commentaires" 
          emoji="💬" 
          hasBackButton={true}
          openProfileModalOnBack={true}
        />
        
        <div className="px-5 py-4 flex flex-col items-center justify-center mt-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Merci pour votre feedback!</h2>
          <p className="text-center text-gray-600 mb-8">
            Votre avis nous aide à améliorer Dinary pour tous les utilisateurs.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full flex items-center justify-center py-3 bg-blue-600 rounded-xl text-white hover:bg-blue-700"
          >
            <span className="font-medium">Envoyer un autre commentaire</span>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader 
        title="Commentaires" 
        emoji="💬" 
        hasBackButton={true}
        openProfileModalOnBack={true}
      />

      <div className="px-5 py-4">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📝</span>
              <div>
                <h3 className="font-medium mb-1">Votre avis compte</h3>
                <p className="text-sm text-gray-600">
                  Partagez votre expérience avec Dinary. Nous apprécions tous vos commentaires et suggestions.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Formulaire de feedback */}
        <form onSubmit={handleSubmit}>
          {/* Type de feedback */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              Type de feedback
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFeedbackType('suggestion')}
                className={`py-2 px-4 rounded-lg text-center ${
                  feedbackType === 'suggestion' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Suggestion
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('bug')}
                className={`py-2 px-4 rounded-lg text-center ${
                  feedbackType === 'bug' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Bug
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('other')}
                className={`py-2 px-4 rounded-lg text-center ${
                  feedbackType === 'other' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Autre
              </button>
            </div>
          </div>
          
          
          {/* Titre */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Titre
            </label>
            <input
              type="text"
              placeholder="Résumez votre feedback en quelques mots"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Description détaillée
            </label>
            <textarea
              placeholder="Partagez plus de détails sur votre commentaire ou suggestion..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
            ></textarea>
          </div>
          
          {/* Catégorie */}
          {feedbackType === 'suggestion' && (
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Catégorie
              </label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none bg-white">
                <option value="">Sélectionnez une catégorie</option>
                <option value="ui">Interface utilisateur</option>
                <option value="features">Nouvelles fonctionnalités</option>
                <option value="payments">Paiements et transferts</option>
                <option value="security">Sécurité et confidentialité</option>
                <option value="rewards">Programme de récompenses</option>
                <option value="performance">Performance de l&apos;application</option>
              </select>
            </div>
          )}
          
          {/* Écran/Page concernée */}
          {feedbackType === 'bug' && (
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Sur quelle page avez-vous rencontré ce problème?
              </label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none bg-white">
                <option value="">Sélectionnez une page</option>
                <option value="home">Accueil</option>
                <option value="wallet">Portefeuille</option>
                <option value="transfer">Transferts</option>
                <option value="cards">Cartes</option>
                <option value="rewards">Récompenses</option>
                <option value="profile">Profil</option>
                <option value="settings">Paramètres</option>
                <option value="other">Autre</option>
              </select>
            </div>
          )}
          
          {/* Upload fichier */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              {feedbackType === 'bug' ? 'Joindre une capture d&apos;écran (optionnel)' : 'Joindre un fichier (optionnel)'}
            </label>
            <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center">
              <button
                type="button"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg inline-block mb-2"
              >
                Parcourir les fichiers
              </button>
              <p className="text-sm text-gray-500">
                ou déposez votre fichier ici
              </p>
              <p className="text-xs text-gray-400 mt-2">
                PNG, JPG ou PDF • 10 Mo max.
              </p>
            </div>
          </div>
          
          {/* Contact */}
          <div className="mb-6">
            <label className="flex items-center mb-2">
              <input type="checkbox" className="rounded text-blue-600 h-5 w-5 mr-2" />
              <span className="text-sm text-gray-700">Me contacter à propos de ce feedback</span>
            </label>
            <p className="text-xs text-gray-500 mb-4 ml-7">
              Nous vous contacterons via l&apos;adresse e-mail associée à votre compte.
            </p>
          </div>
          
          <button 
            type="submit"
            className="w-full flex items-center justify-center py-3 bg-blue-600 rounded-xl text-white hover:bg-blue-700 mb-4"
          >
            <span className="font-medium">Envoyer mon feedback</span>
          </button>
          
          <p className="text-center text-xs text-gray-500">
            En soumettant ce formulaire, vous acceptez que Dinary utilise vos commentaires pour améliorer ses services.
          </p>
        </form>
      </div>
    </div>
  );
}