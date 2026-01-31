'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';

export default function SecurityPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  
  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader 
        title="Sécurité" 
        emoji="🔒" 
        hasBackButton={true}
        backTo="/profile"
        openProfileModalOnBack={true}
      />

      <div className="px-5 py-4">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🛡️</span>
              <div>
                <h3 className="font-medium mb-1">Votre sécurité est notre priorité</h3>
                <p className="text-sm text-gray-600">
                  Protégez votre compte avec ces paramètres de sécurité essentiels.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Informations de connexion */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Informations de connexion</h2>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">Mot de passe</p>
                <p className={`text-sm ${showPassword ? "text-gray-800" : "text-gray-500"}`}>
                  {showPassword ? "MonMotDePasse2025!" : "••••••••••••••••"}
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-sm text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
                <button className="text-sm text-blue-600">Modifier</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Code PIN</p>
                <p className={`text-sm ${showPin ? "text-gray-800" : "text-gray-500"}`}>
                  {showPin ? "123456" : "••••••"}
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-sm text-gray-500"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? "Masquer" : "Afficher"}
                </button>
                <button className="text-sm text-blue-600">Modifier</button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-gray-800 font-medium">Dernière connexion</p>
              <p className="text-sm text-gray-500">12/05/2025 à 08:45</p>
            </div>
            <button className="text-sm text-blue-600">Voir l'historique</button>
          </div>
        </div>

        {/* Vérification à deux facteurs */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Vérification à deux facteurs</h2>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-medium">Vérification par SMS</p>
                <p className="text-xs text-gray-500">Un code sera envoyé à votre téléphone</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Vérification par email</p>
                <p className="text-xs text-gray-500">Un code sera envoyé à votre email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-center py-3 bg-gray-100 rounded-xl text-gray-800 hover:bg-gray-200 mb-4">
            <span className="font-medium">Configurer l'authentification par application</span>
          </button>
        </div>
        
        {/* Appareils connectés */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Appareils connectés</h2>
            <button className="text-sm text-gray-500">Voir tout</button>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">📱</span>
                  </div>
                  <div>
                    <p className="font-medium">iPhone 14 Pro</p>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <p className="text-xs text-gray-500">Actif maintenant • Alger, Algérie</p>
                    </div>
                  </div>
                </div>
                <button className="text-sm text-red-600">Déconnecter</button>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">💻</span>
                  </div>
                  <div>
                    <p className="font-medium">MacBook Pro</p>
                    <p className="text-xs text-gray-500">Dernière activité le 10/05/2025 • Alger, Algérie</p>
                  </div>
                </div>
                <button className="text-sm text-red-600">Déconnecter</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Options de sécurité avancées */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Options avancées</h2>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-medium">Verrouillage automatique</p>
                <p className="text-xs text-gray-500">Après 5 minutes d'inactivité</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-medium">Notifications de connexion</p>
                <p className="text-xs text-gray-500">Recevoir des alertes pour les nouvelles connexions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Biométrie</p>
                <p className="text-xs text-gray-500">Utiliser Face ID ou Touch ID pour la connexion</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center py-3 bg-gray-100 rounded-xl text-gray-800 hover:bg-gray-200">
              <span>Paramètres de sécurité avancés</span>
            </button>
            
            <button className="w-full flex items-center justify-center py-3 bg-red-50 rounded-xl text-red-600 hover:bg-red-100">
              <span>Déconnecter tous les appareils</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}