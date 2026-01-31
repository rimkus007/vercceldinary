'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';

export default function DemanderPage() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recipient, setRecipient] = useState('');
  const [requestMethod, setRequestMethod] = useState<'dinary' | 'qrcode'>('dinary');
  const [qrGenerated, setQrGenerated] = useState(false);
  
  // Utilisateurs Dinary simplifiés
  const dinaryUsers = [
    { id: 'd1', name: 'Sofia Rahmani', username: 'sofiar', avatar: '👩🏽‍💻' },
    { id: 'd2', name: 'Mohamed Cherif', username: 'mohamedch', avatar: '👨🏽‍🔬' },
    { id: 'd3', name: 'Amina Benali', username: 'aminab', avatar: '👩🏽‍🎨' },
  ];
  
  // Générer un QR code
  const generateQrCode = () => {
    if (!amount) {
      alert('Veuillez entrer un montant');
      return;
    }
    setQrGenerated(true);
  };

  // Envoi de la demande
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      alert('Veuillez entrer un montant');
      return;
    }
    
    if (requestMethod === 'dinary') {
      if (!recipient) {
        alert('Veuillez sélectionner un utilisateur Dinary');
        return;
      }
      alert(`Demande envoyée avec succès!`);
    }
    
    // Réinitialiser le formulaire
    setAmount('');
    setDescription('');
    setRecipient('');
    setQrGenerated(false);
  };

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader 
        title="Demander" 
        emoji="💬" 
        showBackButton={true}
      />

      <div className="px-5 py-4">
        {/* En-tête avec indication */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Demande d'argent</h3>
                <p className="text-sm text-gray-600">
                  Demandez facilement de l'argent à d'autres utilisateurs Dinary ou générez un QR code
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sélection de la méthode avec icônes modernes */}
        <div className="flex rounded-lg mb-6 bg-gray-100 p-1">
          <button
            onClick={() => setRequestMethod('dinary')}
            className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center ${
              requestMethod === 'dinary' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Utilisateur
          </button>
          <button
            onClick={() => setRequestMethod('qrcode')}
            className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center ${
              requestMethod === 'qrcode' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            QR Code
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Montant avec style iOS */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Montant</label>
              <span className="text-xs text-gray-500">Dinars algériens</span>
            </div>
            <div className="relative bg-gray-50 rounded-xl overflow-hidden">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-4 bg-transparent text-lg font-medium focus:outline-none"
                placeholder="0.00"
                min="1"
              />
              <span className="absolute right-4 top-4 text-gray-400 font-medium">DA</span>
            </div>
          </div>

          {/* Description avec style iOS */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-transparent focus:outline-none"
                placeholder="Ex: Remboursement restaurant"
                maxLength={50}
              />
            </div>
          </div>

          {/* Méthode Dinary avec style iOS */}
          {requestMethod === 'dinary' && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sélectionner un utilisateur
                </label>
                {recipient && (
                  <button 
                    type="button" 
                    onClick={() => setRecipient('')}
                    className="text-sm text-blue-600"
                  >
                    Modifier
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                {dinaryUsers.map((user) => (
                  <div 
                    key={user.id}
                    onClick={() => setRecipient(user.id)}
                    className={`flex items-center p-4 rounded-xl cursor-pointer ${
                      recipient === user.id 
                        ? 'bg-blue-50 border border-blue-100' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span className="text-xl">{user.avatar}</span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                    {recipient === user.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Méthode QR Code avec style iOS */}
          {requestMethod === 'qrcode' && (
            <div className="mb-5">
              {!qrGenerated ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Générez un QR code pour que d'autres personnes puissent vous envoyer le montant demandé facilement
                  </p>
                  
                  <button
                    type="button"
                    onClick={generateQrCode}
                    disabled={!amount}
                    className={`w-full py-3.5 rounded-xl font-medium flex items-center justify-center ${
                      !amount ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Générer
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  {/* QR code stylisé */}
                  <div className="w-56 h-56 mx-auto p-3 bg-white rounded-xl shadow-sm mb-4 relative flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      className="w-full h-full"
                      fill="currentColor"
                    >
                      <path d="M3,3H9V9H3V3M5,5V7H7V5H5M11,3H21V9H11V3M13,5V7H19V5H13M3,11H9V21H3V11M5,13V19H7V13H5M11,11H21V21H11V11M13,13V19H19V13" />
                    </svg>
                    
                    {/* Logo Dinary superposé */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center">
                        <span className="text-xl">💼</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-lg font-semibold mb-1">{amount} DA</p>
                    <p className="text-sm text-gray-500">{description || "Demande de paiement"}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setQrGenerated(false)}
                      className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Partager
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bouton d'envoi de la demande */}
          {(requestMethod === 'dinary' || !qrGenerated) && (
            <button
              type="submit"
              disabled={requestMethod === 'qrcode' || !amount || (requestMethod === 'dinary' && !recipient)}
              className={`w-full py-4 rounded-xl font-medium flex items-center justify-center ${
                (!amount || (requestMethod === 'dinary' && !recipient))
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Envoyer la demande
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
