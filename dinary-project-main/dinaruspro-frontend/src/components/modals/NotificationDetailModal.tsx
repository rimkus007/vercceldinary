"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Notification } from "@/components/common/NotificationsContext";

interface NotificationDetailModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  const formatDate = (timestamp: string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStylesByType = (type: string) => {
    switch (type) {
      case "transaction":
        return {
          bgGradient: "from-blue-500 to-blue-600",
          lightBg: "bg-blue-50",
          textColor: "text-blue-900",
        };
      case "reward":
        return {
          bgGradient: "from-amber-500 to-amber-600",
          lightBg: "bg-amber-50",
          textColor: "text-amber-900",
        };
      case "promo":
        return {
          bgGradient: "from-green-500 to-green-600",
          lightBg: "bg-green-50",
          textColor: "text-green-900",
        };
      case "alert":
        return {
          bgGradient: "from-red-500 to-red-600",
          lightBg: "bg-red-50",
          textColor: "text-red-900",
        };
      case "system":
      default:
        return {
          bgGradient: "from-gray-500 to-gray-700",
          lightBg: "bg-gray-50",
          textColor: "text-gray-900",
        };
    }
  };

  const styles = getStylesByType(notification.type);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec gradient */}
            <div
              className={`bg-gradient-to-r ${styles.bgGradient} text-white p-6 relative`}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-2xl">
                    {notification.emoji || notification.icon || "🔔"}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{notification.title}</h2>
                  <p className="text-sm opacity-90">
                    {formatDate(notification.timestamp)}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6">
              <div className={`${styles.lightBg} rounded-xl p-4 mb-4`}>
                <p className={`${styles.textColor} text-sm leading-relaxed whitespace-pre-wrap`}>
                  {notification.message}
                </p>
              </div>

              {/* Bouton d'action si lien disponible */}
              {notification.link && (
                <button
                  onClick={() => {
                    window.location.href = notification.link;
                    onClose();
                  }}
                  className={`w-full bg-gradient-to-r ${styles.bgGradient} text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity`}
                >
                  Voir les détails
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

