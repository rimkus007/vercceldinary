'use client';

import React from 'react';
import PageHeader from '@/components/layouts/PageHeader';

export default function InboxPage() {
  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader 
        title="Boîte de réception" 
        emoji="📥" 
        hasBackButton={true}
        openProfileModalOnBack={true}
      />

      <div className="px-5 py-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium text-gray-500">3 nouveaux messages</div>
          <button className="text-blue-600 text-sm font-medium">Tout marquer comme lu</button>
        </div>
        
        {/* Onglets de navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button className="py-3 px-4 border-b-2 border-blue-600 text-blue-600 font-medium">
            Messages
          </button>
          <button className="py-3 px-4 text-gray-500">
            Notifications
          </button>
          <button className="py-3 px-4 text-gray-500">
            Système
          </button>
        </div>
        
        {/* Messages non lus */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">NOUVEAUX</h2>
          
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold">S</span>
                  </div>
                  <div>
                    <p className="font-medium">Support Dinary</p>
                    <p className="text-xs text-gray-500">Aujourd'hui, 10:23</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
                <h3 className="font-medium mb-2">Bienvenue chez Dinary!</h3>
              <p className="text-sm text-gray-600 mb-3">
                Merci d'avoir rejoint Dinary. Nous sommes ravis de vous compter parmi nos utilisateurs. Découvrez toutes nos fonctionnalités...
              </p>
              
              <div className="flex space-x-2">
                <button className="py-2 px-4 bg-blue-600 text-white text-sm rounded-lg">
                  Voir
                </button>
                <button className="py-2 px-4 bg-gray-100 text-gray-700 text-sm rounded-lg">
                  Marquer comme lu
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">🔄</span>
                  </div>
                  <div>
                    <p className="font-medium">Transferts</p>
                    <p className="text-xs text-gray-500">Hier, 18:45</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              
              <h3 className="font-medium mb-2">Transfert reçu</h3>
              <p className="text-sm text-gray-600 mb-3">
                Vous avez reçu un transfert de 500 DZD de la part de Ahmed K. Le montant a été ajouté à votre solde.
              </p>
              
              <div className="flex space-x-2">
                <button className="py-2 px-4 bg-blue-600 text-white text-sm rounded-lg">
                  Voir les détails
                </button>
                <button className="py-2 px-4 bg-gray-100 text-gray-700 text-sm rounded-lg">
                  Marquer comme lu
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">🎁</span>
                  </div>
                  <div>
                    <p className="font-medium">Programme fidélité</p>
                    <p className="text-xs text-gray-500">12/05/2025, 08:30</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              
              <h3 className="font-medium mb-2">Points de fidélité attribués</h3>
              <p className="text-sm text-gray-600 mb-3">
                Félicitations! Vous avez gagné 100 points de fidélité pour vos récents achats. Découvrez comment les utiliser.
              </p>
              
              <div className="flex space-x-2">
                <button className="py-2 px-4 bg-blue-600 text-white text-sm rounded-lg">
                  Voir mes points
                </button>
                <button className="py-2 px-4 bg-gray-100 text-gray-700 text-sm rounded-lg">
                  Marquer comme lu
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Messages lus */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">CONSULTÉS</h2>
          
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600 font-bold">S</span>
                  </div>
                  <div>
                    <p className="font-medium">Sécurité</p>
                    <p className="text-xs text-gray-500">10/05/2025, 14:17</p>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium mb-2">Nouvelle connexion détectée</h3>
              <p className="text-sm text-gray-600 mb-3">
                Une connexion à votre compte a été détectée depuis un nouvel appareil. Si c'était vous, vous pouvez ignorer ce message.
              </p>
              
              <div className="flex space-x-2">
                <button className="py-2 px-4 bg-gray-100 text-gray-700 text-sm rounded-lg">
                  Voir les détails
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600">📊</span>
                  </div>
                  <div>
                    <p className="font-medium">Résumé financier</p>
                    <p className="text-xs text-gray-500">01/05/2025, 00:05</p>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium mb-2">Votre résumé mensuel est disponible</h3>
              <p className="text-sm text-gray-600 mb-3">
                Votre résumé financier du mois d'Avril est maintenant disponible. Consultez-le pour voir vos dépenses et économies.
              </p>
              
              <div className="flex space-x-2">
                <button className="py-2 px-4 bg-gray-100 text-gray-700 text-sm rounded-lg">
                  Voir mon résumé
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <button className="w-full flex items-center justify-center py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200">
          <span className="font-medium">Voir tous les messages</span>
        </button>
      </div>
    </div>
  );
}