'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Types pour le contexte
interface ProfileModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  returnToDashboardWithModal: () => void;
  comingFromProfileModal: boolean;
  setComingFromProfileModal: (value: boolean) => void;
}

// Création du contexte
const ProfileModalContext = createContext<ProfileModalContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useProfileModal = () => {
  const context = useContext(ProfileModalContext);
  if (context === undefined) {
    throw new Error('useProfileModal doit être utilisé à l\'intérieur d\'un ProfileModalProvider');
  }
  return context;
};

// Fournisseur du contexte
export const ProfileModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comingFromProfileModal, setComingFromProfileModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Fermer le modal si on navigue vers une autre page
  useEffect(() => {
    if (!pathname.startsWith('/profile/')) {
      setComingFromProfileModal(false);
    }
  }, [pathname]);

  // Ouvrir le modal
  const openModal = () => {
    setIsOpen(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setIsOpen(false);
  };

  // Basculer l'état du modal
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  // Fonction pour retourner au dashboard et ouvrir le modal
  const returnToDashboardWithModal = () => {
    router.push('/dashboard');
    
    // Petit délai pour permettre la navigation de se terminer
    setTimeout(() => {
      setIsOpen(true);
    }, 100);
  };

  // Valeur du contexte
  const value = {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    returnToDashboardWithModal,
    comingFromProfileModal,
    setComingFromProfileModal
  };

  return (
    <ProfileModalContext.Provider value={value}>
      {children}
    </ProfileModalContext.Provider>
  );
};