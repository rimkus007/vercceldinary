'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';

export default function AppearancePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState('default');
  const [textSize, setTextSize] = useState('medium');
  
  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader 
        title="Apparence" 
        emoji="🎨" 
        hasBackButton={true}
        openProfileModalOnBack={true}
      />

      <div className="px-5 py-4">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">✨</span>
              <div>
                <h3 className="font-medium mb-1">Personnalisez votre expérience</h3>
                <p className="text-sm text-gray-600">
                  Adaptez l'apparence de Dinary selon vos préférences.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mode sombre */}
        <div className="mb-6">
          <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div>
              <p className="font-medium">Mode sombre</p>
              <p className="text-xs text-gray-500">Meilleur pour la nuit et économise la batterie</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={darkMode} 
                onChange={() => setDarkMode(!darkMode)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        
        {/* Thèmes */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Thème de couleur</h2>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div 
              className={`bg-gray-50 border rounded-xl p-4 text-center cursor-pointer ${
                theme === 'default' ? 'border-blue-600' : 'border-gray-100'
              }`}
              onClick={() => setTheme('default')}
            >
              <div className="w-12 h-12 mx-auto bg-blue-600 rounded-full mb-2"></div>
              <p className="text-sm font-medium">Défaut</p>
            </div>
            
            <div 
              className={`bg-gray-50 border rounded-xl p-4 text-center cursor-pointer ${
                theme === 'purple' ? 'border-blue-600' : 'border-gray-100'
              }`}
              onClick={() => setTheme('purple')}
            >
              <div className="w-12 h-12 mx-auto bg-purple-600 rounded-full mb-2"></div>
              <p className="text-sm font-medium">Violet</p>
            </div>
            
            <div 
              className={`bg-gray-50 border rounded-xl p-4 text-center cursor-pointer ${
                theme === 'green' ? 'border-blue-600' : 'border-gray-100'
              }`}
              onClick={() => setTheme('green')}
            >
              <div className="w-12 h-12 mx-auto bg-green-600 rounded-full mb-2"></div>
              <p className="text-sm font-medium">Vert</p>
            </div>
            
            <div 
              className={`bg-gray-50 border rounded-xl p-4 text-center cursor-pointer ${
                theme === 'orange' ? 'border-blue-600' : 'border-gray-100'
              }`}
              onClick={() => setTheme('orange')}
            >
              <div className="w-12 h-12 mx-auto bg-orange-600 rounded-full mb-2"></div>
              <p className="text-sm font-medium">Orange</p>
            </div>
            
            <div 
              className={`bg-gray-50 border rounded-xl p-4 text-center cursor-pointer ${
                theme === 'teal' ? 'border-blue-600' : 'border-gray-100'
              }`}
              onClick={() => setTheme('teal')}
            >
              <div className="w-12 h-12 mx-auto bg-teal-600 rounded-full mb-2"></div>
              <p className="text-sm font-medium">Turquoise</p>
            </div>
            
            <div 
              className={`bg-gray-50 border rounded-xl p-4 text-center cursor-pointer ${
                theme === 'red' ? 'border-blue-600' : 'border-gray-100'
              }`}
              onClick={() => setTheme('red')}
            >
              <div className="w-12 h-12 mx-auto bg-red-600 rounded-full mb-2"></div>
              <p className="text-sm font-medium">Rouge</p>
            </div>
          </div>
        </div>
        
        {/* Taille de texte */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Taille de texte</h2>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="mb-2">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Ajuster la taille</label>
                <span className="text-xs text-gray-500">
                  {textSize === 'small' ? 'Petite' : textSize === 'medium' ? 'Normale' : 'Grande'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  value={textSize === 'small' ? 1 : textSize === 'medium' ? 2 : 3} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setTextSize(val === 1 ? 'small' : val === 2 ? 'medium' : 'large');
                  }}
                  className="w-full h-2.5 bg-blue-600 rounded-full appearance-none"
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs">A</span>
                <span className="text-sm">A</span>
                <span className="text-base">A</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Disposition d'écran d'accueil */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Écran d'accueil</h2>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <p className="font-medium mb-3">Page de démarrage</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2 px-4 rounded-lg text-center bg-blue-600 text-white">
                Dashboard
              </button>
              <button className="py-2 px-4 rounded-lg text-center bg-gray-100 text-gray-700">
                Portefeuille
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-medium">Widgets favoris</p>
                <p className="text-xs text-gray-500">Afficher sur l'écran d'accueil</p>
              </div>
              <button className="text-sm text-blue-600">
                Modifier
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-lg mr-2">💸</span>
                  <p className="text-sm">Transactions récentes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked className="sr-only peer" />
                  <div className="w-9 h-5 bg-blue-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-lg mr-2">📊</span>
                  <p className="text-sm">Statistiques de dépenses</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked className="sr-only peer" />
                  <div className="w-9 h-5 bg-blue-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🎯</span>
                  <p className="text-sm">Objectifs d'épargne</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🔔</span>
                  <p className="text-sm">Notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked className="sr-only peer" />
                  <div className="w-9 h-5 bg-blue-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animations et transitions */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Animations et effets</h2>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-medium">Animations</p>
                <p className="text-xs text-gray-500">Effets de transition entre les écrans</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Effets visuels</p>
                <p className="text-xs text-gray-500">Éléments animés et micro-interactions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <button className="w-full flex items-center justify-center py-3 bg-blue-600 rounded-xl text-white hover:bg-blue-700">
            <span className="font-medium">Appliquer les changements</span>
          </button>
          
          <button className="w-full flex items-center justify-center py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200">
            <span className="font-medium">Restaurer les paramètres par défaut</span>
          </button>
        </div>
      </div>
    </div>
  );
}