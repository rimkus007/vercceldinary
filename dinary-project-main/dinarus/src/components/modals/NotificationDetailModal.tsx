"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Notification } from "@/components/common/NotificationsContext"; // Correction du chemin

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
}

export default function NotificationDetailModal({
  isOpen,
  onClose,
  notification,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="relative bg-white rounded-2xl w-full max-w-md p-6 text-center"
            onClick={(e) => e.stopPropagation()} // Empêche la fermeture en cliquant sur la modale
          >
            {/* Bouton de fermeture */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            {/* Icône de la notification */}
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">
              {notification.emoji || notification.icon || "🔔"}
            </div>

            {/* Titre */}
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {notification.title}
            </h2>

            {/* Message complet */}
            <p className="text-gray-600 mb-4 whitespace-pre-wrap">
              {notification.message}
            </p>

            {/* Date et heure */}
            <p className="text-xs text-gray-400">
              {format(
                new Date(notification.timestamp),
                "d MMMM yyyy 'à' HH:mm",
                { locale: fr }
              )}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
