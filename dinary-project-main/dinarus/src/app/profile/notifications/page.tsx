'use client';

import React from 'react';
import PageHeader from '@/components/layouts/PageHeader';

export default function NotificationsPage() {
  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader 
        title="Paramètres de notification" 
        emoji="🔔" 
        hasBackButton={true}
        openProfileModalOnBack={true}
      />

      <div className="px-5 py-4">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📱</span>
              <div>
                <h3 className="font-medium mb-1">Gérez vos notifications</h3>
                <p className="text-sm text-gray-600">
                  Personnalisez les notifications pour rester informé de ce qui compte pour vous.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications générales */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Notifications générales</h2>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-xs text-gray-500">Recevoir des notifications sur votre appareil</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">Notifications par email</p>
                <p className="text-xs text-gray-500">Recevoir des emails pour les activités importantes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Notifications SMS</p>
                <p className="text-xs text-gray-500">Recevoir des SMS pour les alertes critiques</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications de transactions */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Transactions</h2>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">Paiements sortants</p>
                <p className="text-xs text-gray-500">Lorsque vous effectuez un paiement</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">Paiements entrants</p>
                <p className="text-xs text-gray-500">Lorsque vous recevez de l'argent</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Transactions échouées</p>
                <p className="text-xs text-gray-500">Lorsqu'une transaction ne peut pas être traitée</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications de compte */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Compte et sécurité</h2>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">Connexions</p>
                <p className="text-xs text-gray-500">Notifications de connexion à votre compte</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">Modifications du compte</p>
                <p className="text-xs text-gray-500">Changements de mot de passe, email, etc.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Alertes de sécurité</p>
                <p className="text-xs text-gray-500">Activités suspectes ou inhabituelles</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications marketing */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Marketing et contenu</h2>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">Promotions et offres</p>
                <p className="text-xs text-gray-500">Offres spéciales et remises</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium">Actualités et mises à jour</p>
                <p className="text-xs text-gray-500">Nouvelles fonctionnalités et améliorations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-11 h-6 bg-blue-600 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Enquêtes et retours</p>
                <p className="text-xs text-gray-500">Invitations à donner votre avis</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100">
            <div className="flex items-center">
              <span className="text-lg mr-3">⏱️</span>
              <p className="font-medium">Ne pas déranger</p>
            </div>
            <span className="text-gray-400">→</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100">
            <div className="flex items-center">
              <span className="text-lg mr-3">🔊</span>
              <p className="font-medium">Sons et vibrations</p>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        </div>
        
        <button className="w-full flex items-center justify-center py-3 bg-red-50 rounded-xl text-red-600 hover:bg-red-100 mb-4">
          <span className="font-medium">Désactiver toutes les notifications</span>
        </button>
      </div>
    </div>
  );
}