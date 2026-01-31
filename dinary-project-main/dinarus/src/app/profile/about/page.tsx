'use client';

import React from 'react';
import PageHeader from '@/components/layouts/PageHeader';

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader 
        title="À propos" 
        emoji="ℹ️" 
        hasBackButton={true}
        openProfileModalOnBack={true}
      />

      <div className="px-5 py-4">
        <div className="mb-6">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">💼</span>
            </div>
          </div>
            <h1 className="text-2xl font-bold text-center mb-2">Dinary</h1>
          <p className="text-gray-500 text-sm text-center mb-6">Version 2.4.0</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🚀</span>
              <div>
                <h3 className="font-medium mb-1">Notre mission</h3>
                <p className="text-sm text-gray-600">
                  Révolutionner les services financiers en Algérie en offrant une plateforme mobile sécurisée, innovante et accessible à tous.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notre histoire */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Notre histoire</h2>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3">
              Fondée en 2022 à Alger, Dinary est née de la vision de simplifier les paiements numériques et de promouvoir l'inclusion financière en Algérie.
            </p>
            <p className="text-sm text-gray-700">
              Notre équipe de passionnés combine expertise en technologies financières et connaissance approfondie du marché algérien pour créer une solution adaptée aux besoins locaux.
            </p>
          </div>
          
          {/* Timeline */}
          <div className="space-y-4 mb-6">
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">1</span>
                </div>
                <div className="h-full w-0.5 bg-gray-200 my-1"></div>
              </div>
              <div>
                <h3 className="font-medium">Lancement</h3>
                <p className="text-xs text-gray-500 mb-1">Juin 2022</p>
                <p className="text-sm text-gray-600">Première version de l'application lancée avec les fonctionnalités de base de transfert d'argent.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">2</span>
                </div>
                <div className="h-full w-0.5 bg-gray-200 my-1"></div>
              </div>
              <div>
                <h3 className="font-medium">Expansion</h3>
                <p className="text-xs text-gray-500 mb-1">Janvier 2023</p>
                <p className="text-sm text-gray-600">Introduction des cartes virtuelles et intégration avec les commerces partenaires.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">3</span>
                </div>
                <div className="h-full w-0.5 bg-gray-200 my-1"></div>
              </div>
              <div>
                <h3 className="font-medium">Gamification</h3>
                <p className="text-xs text-gray-500 mb-1">Septembre 2023</p>
                <p className="text-sm text-gray-600">Lancement du système de récompenses et gamification pour encourager l'utilisation quotidienne.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">4</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Aujourd'hui</h3>
                <p className="text-xs text-gray-500 mb-1">Mai 2025</p>
                <p className="text-sm text-gray-600">Plus de 500 000 utilisateurs actifs et un écosystème financier complet.</p>
              </div>
            </div>
          </div>
        </div>
          {/* Notre équipe */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Notre équipe</h2>
          <div className="flex justify-center mb-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center" style={{ maxWidth: '200px' }}>
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 overflow-hidden">
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">👨‍💼</span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900">Houd Karim</h3>
              <p className="text-xs text-gray-500 mb-2">Fondateur & CEO</p>
            </div>
          </div>
        </div>
        
        {/* Informations légales */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Informations légales</h2>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Raison sociale</p>
                <p className="text-sm text-gray-600">Dinary Technologies SPA</p>
              </div>
              <div>
                <p className="text-sm font-medium">Siège social</p>
                <p className="text-sm text-gray-600">123 Rue des Développeurs, Alger, Algérie</p>
              </div>
              <div>
                <p className="text-sm font-medium">RC</p>
                <p className="text-sm text-gray-600">12345678B22</p>
              </div>
              <div>
                <p className="text-sm font-medium">NIF</p>
                <p className="text-sm text-gray-600">0987654321098</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact et réseaux sociaux */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Nous contacter</h2>
          <div className="space-y-3 mb-4">
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-lg">✉️</span>
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-blue-600">contact@dinary.dz</p>
              </div>
            </div>
            
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-lg">📞</span>
              </div>
              <div>
                <p className="font-medium">Téléphone</p>
                <p className="text-sm text-gray-600">+213 770 123 456</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mb-6">
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg">📱</span>
            </button>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg">💬</span>
            </button>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg">📘</span>
            </button>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg">🐦</span>
            </button>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg">📷</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200">
            <span className="font-medium">Conditions d'utilisation</span>
          </button>
          <button className="w-full flex items-center justify-center py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200">
            <span className="font-medium">Politique de confidentialité</span>
          </button>
          <button className="w-full flex items-center justify-center py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200">
            <span className="font-medium">Licences tierces</span>
          </button>
        </div>
      </div>
    </div>
  );
}