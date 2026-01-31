'use client';

import React from 'react';
import PageHeader from '@/components/layouts/PageHeader';

export default function DocumentsPage() {
  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader 
        title="Documents" 
        emoji="📄" 
        hasBackButton={true}
        openProfileModalOnBack={true}
      />

      <div className="px-5 py-4">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📋</span>
              <div>
                <h3 className="font-medium mb-1">Gérez vos documents importants</h3>
                <p className="text-sm text-gray-600">
                  Tous vos documents et reçus sont stockés en toute sécurité ici.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents personnels */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Documents personnels</h2>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">🪪</span>
                </div>
                <div>
                  <h3 className="font-medium">Carte d'identité</h3>
                  <p className="text-xs text-gray-500">Ajouté le 23/04/2025</p>
                </div>
              </div>
              <button className="text-sm text-blue-600">Voir</button>
            </div>
            
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">🏛️</span>
                </div>
                <div>
                  <h3 className="font-medium">Justificatif de domicile</h3>
                  <p className="text-xs text-gray-500">Ajouté le 05/03/2025</p>
                </div>
              </div>
              <button className="text-sm text-blue-600">Voir</button>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-center py-3 bg-gray-100 rounded-xl text-gray-800 hover:bg-gray-200">
            <span className="text-lg mr-2">➕</span>
            <span className="font-medium">Ajouter un document</span>
          </button>
        </div>

        {/* Reçus et factures */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Reçus et factures</h2>
            <button className="text-sm text-gray-500">Voir tout</button>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mr-3">
                    <span>🍽️</span>
                  </div>
                  <div>
                    <p className="font-medium">Gaia Café</p>
                    <p className="text-xs text-gray-500">11/05/2025 à 12:15</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">80 DA</p>
                  <button className="text-xs text-blue-600">Télécharger</button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mr-3">
                    <span>🥬</span>
                  </div>
                  <div>
                    <p className="font-medium">Bio&Co</p>
                    <p className="text-xs text-gray-500">09/05/2025 à 14:30</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">320 DA</p>
                  <button className="text-xs text-blue-600">Télécharger</button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mr-3">
                    <span>📱</span>
                  </div>
                  <div>
                    <p className="font-medium">Recharge</p>
                    <p className="text-xs text-gray-500">05/05/2025 à 09:45</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">500 DA</p>
                  <button className="text-xs text-blue-600">Télécharger</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contrats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Contrats et conditions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100">
              <div className="flex items-center">
                <span className="text-lg mr-3">📝</span>
                <p className="font-medium">Conditions d'utilisation</p>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100">
              <div className="flex items-center">
                <span className="text-lg mr-3">🔒</span>
                <p className="font-medium">Politique de confidentialité</p>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100">
              <div className="flex items-center">
                <span className="text-lg mr-3">⚖️</span>
                <p className="font-medium">Mentions légales</p>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}