'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    name: string;
    username: string;
    avatar: string;
  } | null;
}

// Types de transfert disponibles
type TransferType = 'instant' | 'differed' | 'scheduled';

export default function SendMoneyModal({
  isOpen,
  onClose,
  recipient
}: SendMoneyModalProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transferType, setTransferType] = useState<TransferType>('instant');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [differedDate, setDifferedDate] = useState('');

  // Obtenir la date minimale pour les planifications (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];

  // Empêcher le défilement du corps quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setAmount('');
      setMessage('');
      setShowConfirmation(false);
      setTransferType('instant');
      setScheduledDate('');
      setScheduledTime('');
      setDifferedDate('');
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    
    // Ici, vous implémenterez la logique d'envoi d'argent
    // selon le type de transfert choisi
    
    setShowConfirmation(true);
  };

  const handleClose = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      onClose();
    }
  };

  // Générer le message de confirmation selon le type de transfert
  const getConfirmationMessage = () => {
    if (transferType === 'instant') {
      return `Vous avez envoyé ${amount} DA à ${recipient?.name}`;
    } else if (transferType === 'differed') {
      return `Votre paiement de ${amount} DA à ${recipient?.name} sera envoyé le ${new Date(differedDate).toLocaleDateString('fr-FR')}`;
    } else {
      const dateFormatted = new Date(scheduledDate).toLocaleDateString('fr-FR');
      return `Votre paiement de ${amount} DA à ${recipient?.name} est programmé pour le ${dateFormatted} à ${scheduledTime}`;
    }
  };

  if (!isOpen || !recipient) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay avec effet de flou */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal avec effet glassmorphique */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-sm mx-4 bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl overflow-hidden"
          >
            {!showConfirmation ? (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="absolute top-4 right-4">
                  <button 
                    type="button" 
                    onClick={handleClose}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>
                
                {/* En-tête avec le destinataire */}
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-2xl mr-4">
                    {recipient.avatar}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{recipient.name}</h3>
                    <p className="text-sm text-gray-500">@{recipient.username}</p>
                  </div>
                </div>
                
                {/* Type de transfert */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de transfert
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTransferType('instant')}
                      className={`p-3 rounded-lg text-center text-sm ${
                        transferType === 'instant'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="block text-lg mb-1">📱</span>
                      Instantané
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferType('differed')}
                      className={`p-3 rounded-lg text-center text-sm ${
                        transferType === 'differed'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="block text-lg mb-1">⏱️</span>
                      Différé
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferType('scheduled')}
                      className={`p-3 rounded-lg text-center text-sm ${
                        transferType === 'scheduled'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="block text-lg mb-1">📅</span>
                      Planifié
                    </button>
                  </div>
                </div>
                
                {/* Options spécifiques au type de transfert */}
                {transferType === 'differed' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'envoi
                    </label>
                    <input
                      type="date"
                      value={differedDate}
                      onChange={(e) => setDifferedDate(e.target.value)}
                      min={today}
                      className="w-full p-3 bg-white/50 border border-gray-300/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                )}
                
                {transferType === 'scheduled' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'envoi
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={today}
                        className="w-full p-3 bg-white/50 border border-gray-300/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heure d'envoi
                      </label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full p-3 bg-white/50 border border-gray-300/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </>
                )}
                
                {/* Zone de saisie du montant */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">DA</span>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full p-3 pl-10 bg-white/50 border border-gray-300/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                {/* Zone de message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (optionnel)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ajouter un message..."
                    className="w-full p-3 bg-white/50 border border-gray-300/50 rounded-lg shadow-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Bouton d'envoi */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  {transferType === 'instant' ? 'Envoyer maintenant' : 
                   transferType === 'differed' ? 'Envoyer plus tard' : 
                   'Programmer l\'envoi'}
                </motion.button>
              </form>
            ) : (
              <div className="p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-xl font-medium mb-2">
                  {transferType === 'instant' ? 'Paiement envoyé !' : 'Paiement programmé !'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {getConfirmationMessage()}
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Terminer
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}