'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const WalletPage = () => {
  const [period, setPeriod] = useState('30j');
  return (
    <main className="p-4 pb-24 bg-gradient-to-b from-white to-blue-50 min-h-screen text-gray-800 font-sans max-w-md mx-auto">

      {/* Header */}
      <header className="mb-6 relative">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/" className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md">
            <span className="text-gray-600">←</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">💼 Portefeuille</h1>
        </div>
        <section className="bg-white shadow-md rounded-2xl p-4">
          <div className="flex flex-col items-center text-center">
            <div className="mb-2">
              <p className="text-xs text-gray-500">Gérez vos fonds et vos opérations</p>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm shadow hover:bg-purple-700 transition">
              💳 Recharger
            </button>
          </div>
        </section>
      </header>      {/* Solde */}
      <section className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-md">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="text-4xl mb-3">💎</div>
          <div>
            <p className="text-sm opacity-90">Solde disponible</p>
            <h2 className="text-3xl font-bold">1 234,56 DA</h2>
            <p className="text-xs opacity-70 mt-1">Mis à jour il y a 2h</p>
          </div>
        </div>
        <div className="h-2 bg-white/30 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-white/70 rounded-full" style={{ width: '72%' }}></div>
        </div>
        <div className="flex flex-col items-center text-center text-xs mt-2 opacity-80 space-y-1">
          <span>Dernier retrait : 500 DA</span>
          <span>Il y a 5 jours</span>
        </div>
      </section>

      {/* Bouton Retrait */}
      <button className="w-full mb-6 py-3 bg-green-500 hover:bg-green-600 transition text-white font-bold rounded-2xl shadow">
        💸 Effectuer un retrait
      </button>

      {/* Graphique */}
      <section className="bg-white shadow-md rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-700">📈 Évolution du solde</h3>
          <select
            className="text-sm border border-gray-200 rounded-lg px-2 py-1"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7j">7 jours</option>
            <option value="30j">30 jours</option>
            <option value="12m">12 mois</option>
          </select>
        </div>
        <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
          (Graphique Chart.js à intégrer ici)
        </div>
      </section>

      {/* Dernières transactions */}
      <section className="bg-white shadow-md rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-700">📄 Dernières transactions</h3>
          <button className="text-xs text-purple-600 font-semibold">Voir tout →</button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                💰
              </div>
              <div>
                <p className="font-semibold text-gray-800">Paiement reçu</p>
                <p className="text-xs text-gray-500">Client #932 • Il y a 2h</p>
              </div>
            </div>
            <p className="font-bold text-green-600">+1 500 DA</p>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                💸
              </div>
              <div>
                <p className="font-semibold text-gray-800">Retrait validé</p>
                <p className="text-xs text-gray-500">Vers CCP • Il y a 5j</p>
              </div>
            </div>
            <p className="font-bold text-red-500">-500 DA</p>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                🔄
              </div>
              <div>
                <p className="font-semibold text-gray-800">Remboursement</p>
                <p className="text-xs text-gray-500">Commande #154 • Il y a 1s</p>
              </div>
            </div>
            <p className="font-bold text-blue-600">+250 DA</p>
          </div>
        </div>
      </section>

      {/* Retraits en cours */}
      <section className="bg-white shadow-md rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-700">🔄 Retraits en attente</h3>
          <button className="text-xs text-purple-600 font-semibold">Nouveau →</button>
        </div>
        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-sm">
          Retrait de 1 000 DA vers CCP - En attente ⏳
        </div>
      </section>
    </main>
  );
};

export default WalletPage;
