'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';

export default function AccessibilityPage() {
  const [fontSize, setFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  
  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader 
        title="Accessibilité" 
        emoji="♿" 
        hasBackButton={true}
        backTo="/profile"
        openProfileModalOnBack={true}
      />

      <div className="px-5 py-4">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">👋</span>
              <div>
                <h3 className="font-medium mb-1">Une application pour tous</h3>
                <p className="text-sm text-gray-600">
                  Dinary s'engage à fournir une expérience accessible à tous les utilisateurs, quelles que soient leurs capacités.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Réglages d'affichage */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Affichage</h2>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Taille du texte</label>
                <span className="text-xs text-gray-500">{fontSize === 'small' ? 'Petite' : fontSize === 'medium' ? 'Normale' : 'Grande'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  value={fontSize === 'small' ? 1 : fontSize === 'medium' ? 2 : 3} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFontSize(val === 1 ? 'small' : val === 2 ? 'medium' : 'large');
                  }}
                  className="w-full h-2.5 bg-blue-600 rounded-full appearance-none"
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs">A</span>
                <span className="text-xs">A</span>
                <span className="text-xs">A</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">Mode contraste élevé</p>
                <p className="text-xs text-gray-500">Améliore la lisibilité du contenu</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={highContrast} 
                  onChange={() => setHighContrast(!highContrast)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Réduire les animations</p>
                <p className="text-xs text-gray-500">Désactive ou réduit les effets de mouvement</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={reduceMotion} 
                  onChange={() => setReduceMotion(!reduceMotion)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Outils d'assistance */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Outils d'assistance</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Lecteur d'écran</p>
                  <p className="text-xs text-gray-500">Optimiser l'application pour votre lecteur d'écran</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={screenReader} 
                    onChange={() => setScreenReader(!screenReader)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">🔊</span>
                </div>
                <div>
                  <p className="font-medium">Lecture vocale</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Écoutez le contenu de l'application au lieu de le lire
                  </p>
                  <button className="w-full py-2 bg-gray-100 rounded-lg text-gray-700 text-sm">
                    Configurer la lecture vocale
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">🎨</span>
                </div>
                <div>
                  <p className="font-medium">Daltonisme</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Adaptez les couleurs pour les personnes atteintes de daltonisme
                  </p>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none bg-white">
                    <option value="normal">Normal</option>
                    <option value="protanopia">Protanopie (rouge-vert)</option>
                    <option value="deuteranopia">Deutéranopie (vert-rouge)</option>
                    <option value="tritanopia">Tritanopie (bleu-jaune)</option>
                    <option value="achromatopsia">Achromatopsie (noir et blanc)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Raccourcis clavier et gestes */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Raccourcis et gestes</h2>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="mb-3">
              <h3 className="font-medium text-gray-800 mb-2">Gestes tactiles personnalisés</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Double tap</span>
                  <span className="text-gray-500">Agrandir le texte</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Balayer vers la droite</span>
                  <span className="text-gray-500">Retour en arrière</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pincement à 3 doigts</span>
                  <span className="text-gray-500">Accueil</span>
                </div>
              </div>
            </div>
            
            <button className="w-full py-2 bg-gray-200 rounded-lg text-gray-700 text-sm">
              Personnaliser les gestes
            </button>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h3 className="font-medium text-gray-800 mb-2">Assistance vocale</h3>
            <p className="text-sm text-gray-600 mb-3">
              Vous pouvez utiliser les commandes vocales pour naviguer dans l'application.
            </p>
            <div className="flex">
              <button className="flex-1 py-2 bg-gray-200 rounded-lg text-gray-700 text-sm mr-2">
                Voir les commandes
              </button>
              <button className="flex-1 py-2 bg-blue-600 rounded-lg text-white text-sm">
                Activer
              </button>
            </div>
          </div>
        </div>
        
        {/* Autres paramètres */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Autres paramètres</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div>
                <p className="font-medium">Langue de l'application</p>
                <p className="text-xs text-gray-500">Actuellement en Français</p>
              </div>
              <button className="text-sm text-blue-600">
                Modifier
              </button>
            </div>
            
            <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div>
                <p className="font-medium">Sous-titres</p>
                <p className="text-xs text-gray-500">Pour les contenus vidéo et audio</p>
              </div>
              <button className="text-sm text-blue-600">
                Configurer
              </button>
            </div>
            
            <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div>
                <p className="font-medium">Notifications sonores</p>
                <p className="text-xs text-gray-500">Sons et alertes vocales</p>
              </div>
              <button className="text-sm text-blue-600">
                Gérer
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📩</span>
              <div>
                <h3 className="font-medium mb-1">Besoin d'aide supplémentaire?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Si vous avez des besoins d'accessibilité spécifiques, n'hésitez pas à nous contacter.
                </p>
                <button className="py-2 px-4 bg-blue-600 rounded-lg text-white text-sm">
                  Contacter l'équipe d'assistance
                </button>
              </div>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-center py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200">
            <span className="font-medium">Guide complet d'accessibilité</span>
          </button>
        </div>
      </div>
    </div>
  );
}