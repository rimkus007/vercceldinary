'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useProfileModal } from '@/components/common/ProfileModalContext';

interface BackToProfileButtonProps {
  className?: string;
}

export default function BackToProfileButton({ className = '' }: BackToProfileButtonProps) {
  const { returnToDashboardWithModal, comingFromProfileModal } = useProfileModal();

  // Si l'utilisateur n'est pas venu du modal profil, on ne montre pas ce bouton
  if (!comingFromProfileModal) return null;

  return (
    <motion.button
      className={`p-2 relative ${className}`}
      whileTap={{ scale: 0.95 }}
      onClick={() => returnToDashboardWithModal()}
      aria-label="Retourner au profil"
    >
      <div className="w-9 h-9 rounded-full bg-black/5 backdrop-blur-sm flex items-center justify-center">
        <span className="text-xl">←</span>
      </div>
      <div className="absolute inset-0 bg-blue-300/20 rounded-full filter blur-md -z-10 opacity-50"></div>
    </motion.button>
  );
}