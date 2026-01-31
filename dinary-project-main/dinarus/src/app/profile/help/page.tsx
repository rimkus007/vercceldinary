'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

// Définitions des étapes pour chaque guide
const addMoneySteps = [
  {
    title: "Accéder à la page de rechargement",
    content: "Sur l'écran d'accueil, appuyez sur le bouton 'Recharger' en bas de l'écran ou accédez à la section 'Portefeuille' puis 'Recharger'.",
    image: "💰"
  },
  {
    title: "Choisir la méthode de rechargement",
    content: "Sélectionnez votre méthode préférée : carte bancaire, virement bancaire ou point de vente physique.",
    image: "💳"
  },
  {
    title: "Saisir le montant",
    content: "Entrez le montant que vous souhaitez ajouter à votre compte. Le minimum est de 500 DZD.",
    image: "💵"
  },
  {
    title: "Confirmer le rechargement",
    content: "Vérifiez les détails et confirmez. Pour les cartes bancaires, vous serez redirigé vers une page de paiement sécurisée.",
    image: "✅"
  },
  {
    title: "Reçu et confirmation",
    content: "Une fois le paiement traité, vous recevrez une confirmation et le solde sera immédiatement disponible sur votre compte.",
    image: "🧾"
  }
];

const sendMoneySteps = [
  {
    title: "Accéder à l'option d'envoi",
    content: "Sur l'écran d'accueil, appuyez sur le bouton 'Envoyer' ou accédez à la section 'Envoyer' depuis le menu.",
    image: "📤"
  },
  {
    title: "Sélectionner le destinataire",
    content: "Choisissez un contact existant ou entrez un nouveau numéro de téléphone/identifiant Dinary.",
    image: "👥"
  },
  {
    title: "Saisir le montant",
    content: "Entrez le montant que vous souhaitez envoyer et ajoutez éventuellement une note ou un message.",
    image: "💸"
  },
  {
    title: "Vérifier les détails",
    content: "Vérifiez le destinataire et le montant avant de confirmer la transaction.",
    image: "🔍"
  },
  {
    title: "Confirmer et envoyer",
    content: "Confirmez la transaction avec votre PIN ou empreinte digitale. Le transfert est instantané.",
    image: "✓"
  }
];

const rewardsSystemSteps = [
  {
    title: "Comprendre les niveaux",
    content: "Le système de niveaux Dinary est infini. Plus vous utilisez l'application, plus vous gagnez d'XP et progressez dans les niveaux.",
    image: "📊"
  },
  {
    title: "Gagner de l'XP",
    content: "Effectuez des transactions, complétez des missions, invitez des amis ou faites des achats pour gagner des points d'expérience (XP).",
    image: "⭐"
  },
  {
    title: "Avantages par niveau",
    content: "Chaque niveau débloque de nouveaux avantages : cashback plus élevé, frais réduits, support prioritaire, offres exclusives, etc.",
    image: "🎁"
  },
  {
    title: "Suivre votre progression",
    content: "Consultez votre niveau actuel et votre progression dans la section 'Progression' ou depuis votre profil.",
    image: "📈"
  },
  {
    title: "Missions spéciales",
    content: "Complétez des missions spéciales pour gagner des bonus d'XP et accélérer votre progression de niveau.",
    image: "🏆"
  }
];

const refundRequestSteps = [
  {
    title: "Identifier la transaction",
    content: "Dans la section 'Historique', trouvez et sélectionnez la transaction pour laquelle vous souhaitez un remboursement.",
    image: "🧾"
  },
  {
    title: "Initier la demande",
    content: "Appuyez sur le bouton 'Options' puis sélectionnez 'Demander un remboursement'.",
    image: "↩️"
  },
  {
    title: "Expliquer la raison",
    content: "Choisissez la raison du remboursement et fournissez les détails nécessaires pour justifier votre demande.",
    image: "📝"
  },
  {
    title: "Soumettre des preuves",
    content: "Si nécessaire, téléchargez des documents ou photos pour appuyer votre demande (reçus, captures d'écran, etc.).",
    image: "📎"
  },
  {
    title: "Suivre votre demande",
    content: "Vous pouvez suivre l'état de votre demande dans la section 'Support' > 'Mes demandes'. Vous recevrez également des notifications sur l'avancement.",
    image: "🔍"
  }
];

export default function HelpPage() {
  // État pour contrôler l'affichage des modals
  const [showGuidesModal, setShowGuidesModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<'none' | 'addMoney' | 'sendMoney' | 'rewards' | 'refund'>('none');
  const [currentStep, setCurrentStep] = useState(0);
  
  // Fonction pour sélectionner un guide spécifique
  const openGuide = (guide: 'addMoney' | 'sendMoney' | 'rewards' | 'refund') => {
    setSelectedGuide(guide);
    setCurrentStep(0);
    setShowGuidesModal(false); // Fermer le modal principal des guides
  };
  
  // Fermer le guide actuel
  const closeGuide = () => {
    setSelectedGuide('none');
    setCurrentStep(0);
  };
  
  // Navigation entre les étapes
  const nextStep = () => {
    let maxSteps = 0;
    switch (selectedGuide) {
      case 'addMoney': maxSteps = addMoneySteps.length; break;
      case 'sendMoney': maxSteps = sendMoneySteps.length; break;
      case 'rewards': maxSteps = rewardsSystemSteps.length; break;
      case 'refund': maxSteps = refundRequestSteps.length; break;
    }
    
    if (currentStep < maxSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Obtenir les étapes actuelles basées sur le guide sélectionné
  const getCurrentSteps = () => {
    switch (selectedGuide) {
      case 'addMoney': return addMoneySteps;
      case 'sendMoney': return sendMoneySteps;
      case 'rewards': return rewardsSystemSteps;
      case 'refund': return refundRequestSteps;
      default: return [];
    }
  };
  
  // Obtenir le titre du guide actuel
  const getCurrentGuideTitle = () => {
    switch (selectedGuide) {
      case 'addMoney': return "Comment ajouter de l'argent";
      case 'sendMoney': return "Envoyer de l'argent";
      case 'rewards': return "Système de niveaux et récompenses";
      case 'refund': return "Effectuer une demande de remboursement";
      default: return "";
    }
  };
  
  // Obtenir l'icône du guide actuel
  const getCurrentGuideIcon = () => {
    switch (selectedGuide) {
      case 'addMoney': return "💰";
      case 'sendMoney': return "📤";
      case 'rewards': return "🏆";
      case 'refund': return "🔄";
      default: return "";
    }
  };
  
  // Obtenir la couleur du guide actuel
  const getCurrentGuideColor = () => {
    switch (selectedGuide) {
      case 'addMoney': return "bg-blue-50";
      case 'sendMoney': return "bg-green-50";
      case 'rewards': return "bg-amber-50";
      case 'refund': return "bg-red-50";
      default: return "bg-gray-50";
    }
  };
  
  // Liste des guides pas à pas
  const stepByStepGuides = [
    {
      id: 'addMoney',
      title: "Comment ajouter de l'argent",
      icon: "💰",
      description: "Découvrez les différentes méthodes pour recharger votre compte Dinary.",
      color: "bg-blue-100"
    },
    {
      id: 'sendMoney',
      title: "Envoyer de l'argent",
      icon: "📤",
      description: "Apprenez à effectuer des transferts instantanés vers d'autres utilisateurs.",
      color: "bg-green-100"
    },
    {
      id: 'rewards',
      title: "Système de niveaux et récompenses",
      icon: "🏆",
      description: "Comprendre le système de progression et maximiser vos récompenses.",
      color: "bg-amber-100"
    },
    {
      id: 'refund',
      title: "Effectuer une demande de remboursement",
      icon: "🔄",
      description: "Procédure pas à pas pour demander un remboursement.",
      color: "bg-red-100"
    },
    {
      id: 'inviteFriends',
      title: "Inviter des amis",
      icon: "👥",
      description: "Comment utiliser notre programme de parrainage et gagner des récompenses.",
      color: "bg-indigo-100"
    },
    {
      id: 'notifications',
      title: "Configurer les notifications",
      icon: "🔔",
      description: "Personnalisez vos alertes et notifications selon vos préférences.",
      color: "bg-teal-100"
    }
  ];

  return (
    <div className="bg-white min-h-screen mb-16">
      <PageHeader 
        title="Aide" 
        emoji="❓" 
        hasBackButton={true}
        openProfileModalOnBack={true}
      />

      <div className="px-5 py-4">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">💡</span>
              <div>
                <h3 className="font-medium mb-1">Centre d&apos;aide Dinary</h3>
                <p className="text-sm text-gray-600">
                  Comment pouvons-nous vous aider aujourd&apos;hui ?
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Rechercher dans l'aide..."
              className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">🔍</span>
            </div>
          </div>
        </div>
        
        {/* Aide rapide */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Aide rapide</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">💸</span>
              </div>
              <p className="text-sm font-medium">Transferts</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
              <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">💳</span>
              </div>
              <p className="text-sm font-medium">Cartes</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">👤</span>
              </div>
              <p className="text-sm font-medium">Compte</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
              <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">🔒</span>
              </div>
              <p className="text-sm font-medium">Sécurité</p>
            </div>
          </div>
        </div>
        
        {/* Questions fréquentes */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Questions fréquentes</h2>
            <button className="text-sm text-blue-600">Voir tout</button>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="font-medium mb-1">Comment ajouter de l&apos;argent à mon compte ?</p>
              <p className="text-sm text-gray-600">Découvrez les différentes méthodes pour recharger votre compte Dinary.</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="font-medium mb-1">Comment envoyer de l&apos;argent à un ami ?</p>
              <p className="text-sm text-gray-600">Apprenez à effectuer des transferts instantanés vers d&apos;autres utilisateurs.</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="font-medium mb-1">J&apos;ai oublié mon mot de passe</p>
              <p className="text-sm text-gray-600">Suivez le processus de récupération de votre mot de passe.</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="font-medium mb-1">Comment utiliser ma carte virtuelle ?</p>
              <p className="text-sm text-gray-600">Guide complet d&apos;utilisation de votre carte Dinary pour les achats.</p>
            </div>
          </div>
        </div>
        
        {/* Guides et tutoriels */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Guides et tutoriels</h2>
          
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">🎬</span>
                </div>
                <div>
                  <p className="font-medium">Tutoriels vidéo</p>
                  <p className="text-sm text-gray-600">
                    Apprenez à utiliser Dinary avec nos vidéos explicatives.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Section des guides pas à pas avec bouton cliquable */}
            <motion.div 
              className="bg-gray-50 border border-gray-100 rounded-xl p-4 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGuidesModal(true)}
            >
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">📚</span>
                </div>
                <div>
                  <p className="font-medium">Guides pas à pas</p>
                  <p className="text-sm text-gray-600">
                    Instructions détaillées pour toutes les fonctionnalités.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Nous contacter */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Nous contacter</h2>
          
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <p className="font-medium">Chat en direct</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Discutez avec notre équipe d&apos;assistance.
                  </p>
                  <p className="text-xs text-green-600">En ligne • Temps d&apos;attente &lt; 5 min</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">📞</span>
                </div>
                <div>
                  <p className="font-medium">Service client</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Appelez-nous au +213 770 123 456.
                  </p>
                  <p className="text-xs text-gray-500">Lun-Ven: 8h-20h • Sam: 9h-17h</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-lg">✉️</span>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-600">
                    Envoyez-nous un message à support@dinary.dz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button className="w-full flex items-center justify-center py-3 bg-blue-600 rounded-xl text-white hover:bg-blue-700 mb-4">
          <span className="font-medium">Contacter l&apos;assistance</span>
        </button>
      </div>
      
      {/* Modal principal des guides pas à pas */}
      <AnimatePresence>
        {showGuidesModal && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              {/* En-tête du modal */}
              <div className="p-4 bg-green-50 border-b border-green-100 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">📚</span>
                  <h3 className="font-semibold text-lg">Guides pas à pas</h3>
                </div>
                <button 
                  className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center"
                  onClick={() => setShowGuidesModal(false)}
                >
                  <span>✕</span>
                </button>
              </div>
              
              {/* Corps du modal avec la liste des guides */}
              <div className="p-4 overflow-y-auto">
                <p className="text-gray-600 mb-4">
                  Sélectionnez un guide ci-dessous pour des instructions détaillées sur les fonctionnalités de Dinary.
                </p>
                
                <div className="space-y-3">
                  {stepByStepGuides.map((guide) => (
                    <motion.div 
                      key={guide.id}
                      className="bg-gray-50 border border-gray-100 rounded-xl p-4 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openGuide(guide.id as 'addMoney' | 'sendMoney' | 'rewards' | 'refund')}
                    >
                      <div className="flex items-start">
                        <div className={`w-10 h-10 ${guide.color} rounded-lg flex items-center justify-center mr-3`}>
                          <span className="text-lg">{guide.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium">{guide.title}</p>
                          <p className="text-sm text-gray-600">{guide.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Pied du modal */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button 
                  className="w-full py-2.5 bg-green-600 text-white rounded-lg flex items-center justify-center"
                  onClick={() => setShowGuidesModal(false)}
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal des étapes détaillées pour un guide spécifique */}
      <AnimatePresence>
        {selectedGuide !== 'none' && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              {/* En-tête du guide */}
              <div className={`p-4 ${getCurrentGuideColor()} flex justify-between items-center sticky top-0 z-10`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{getCurrentGuideIcon()}</span>
                  <h3 className="font-semibold text-lg">{getCurrentGuideTitle()}</h3>
                </div>
                <button 
                  className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center"
                  onClick={closeGuide}
                >
                  <span>✕</span>
                </button>
              </div>
              
              {/* Contenu de l'étape actuelle */}
              <div className="p-6 flex-grow overflow-y-auto">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-sm text-gray-500">
                    Étape {currentStep + 1} sur {getCurrentSteps().length}
                  </span>
                  <div className="h-1 flex-grow mx-4 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${((currentStep + 1) / getCurrentSteps().length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mb-6 text-center">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-6xl mb-6 inline-block">{getCurrentSteps()[currentStep]?.image}</span>
                    <h4 className="text-xl font-semibold mb-3">{getCurrentSteps()[currentStep]?.title}</h4>
                    <p className="text-gray-600">{getCurrentSteps()[currentStep]?.content}</p>
                  </motion.div>
                </div>
              </div>
              
              {/* Navigation entre les étapes */}
              <div className="p-4 border-t border-gray-100 flex justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600'
                  }`}
                >
                  <span className="mr-1">←</span> Précédent
                </button>
                
                {currentStep < getCurrentSteps().length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center"
                  >
                    Suivant <span className="ml-1">→</span>
                  </button>
                ) : (
                  <button
                    onClick={closeGuide}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg"
                  >
                    Terminer
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}