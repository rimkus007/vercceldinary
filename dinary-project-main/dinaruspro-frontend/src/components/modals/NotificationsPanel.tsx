"use client";

import React, { useEffect, useState } from "react";
import NotificationDetailModal from "@/components/modals/NotificationDetailModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Notification,
  useNotifications,
} from "@/components/common/NotificationsContext";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export default function NotificationsPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
}: NotificationsPanelProps) {
  // State for detail modal
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
    
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Fonctions de style et de formatage ---
  const formatDate = (timestamp: string | number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `Aujourd'hui, ${hours}:${minutes}`;
    } else if (diffDays === 1) {
      return "Hier";
    } else {
      const day = date.getDate();
      const month = date.toLocaleString("fr-FR", { month: "long" });
      return `${day} ${month}`;
    }
  };

  const getIconByType = (notification: Notification) => {
    // Priorité à l'emoji personnalisé de l'admin
    if (notification.emoji) return notification.emoji;
    // Sinon utiliser l'icône existante
    if (notification.icon) return notification.icon;
    // Fallback sur le type
    switch (notification.type) {
      case "transaction":
        return "💳";
      case "reward":
        return "🏆";
      case "promo":
        return "🎁";
      case "alert":
        return "⚠️";
      case "system":
      default:
        return "🔔";
    }
  };

  const getStylesByType = (type: string) => {
    switch (type) {
      case "transaction":
        return {
          bgGradient: "from-blue-100/70 to-blue-50/50",
          iconGradient: "from-blue-500 to-blue-600",
          borderColor: "border-blue-200/50",
          textColor: "text-blue-800",
        };
      case "reward":
        return {
          bgGradient: "from-amber-100/70 to-amber-50/50",
          iconGradient: "from-amber-500 to-amber-600",
          borderColor: "border-amber-200/50",
          textColor: "text-amber-800",
        };
      case "promo":
        return {
          bgGradient: "from-green-100/70 to-green-50/50",
          iconGradient: "from-green-500 to-green-600",
          borderColor: "border-green-200/50",
          textColor: "text-green-800",
        };
      case "alert":
        return {
          bgGradient: "from-red-100/70 to-red-50/50",
          iconGradient: "from-red-500 to-red-600",
          borderColor: "border-red-200/50",
          textColor: "text-red-800",
        };
      case "system":
      default:
        return {
          bgGradient: "from-gray-100/70 to-gray-50/50",
          iconGradient: "from-gray-500 to-gray-700",
          borderColor: "border-gray-200/50",
          textColor: "text-gray-800",
        };
    }
  };

  const groupedNotifications: Record<string, Notification[]> = {};
  notifications.forEach((notification) => {
    const date = formatDate(notification.timestamp);
    if (!groupedNotifications[date]) groupedNotifications[date] = [];
    groupedNotifications[date].push(notification);
  });

  const hasUnreadNotifications = notifications.some((n) => !n.isRead);
  const { deleteAllNotifications } = useNotifications();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex justify-end items-start p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="relative w-96 max-w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50 flex flex-col max-h-[90vh]"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-3 px-4 flex justify-between items-center border-b border-gray-200/50 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Notifications
                </h2>
                <div className="flex space-x-2">
                  {hasUnreadNotifications && (
                    <motion.button
                      className="text-xs font-medium text-blue-600"
                      onClick={onMarkAllAsRead}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Tout marquer comme lu
                    </motion.button>
                  )}
                  <motion.button
                    className="text-xs font-medium text-red-600"
                    onClick={deleteAllNotifications}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Tout supprimer
                  </motion.button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto overscroll-contain">
                {notifications.length > 0 ? (
                  Object.entries(groupedNotifications).map(([date, items]) => (
                    <div key={date} className="mb-3">
                      <div className="sticky top-0 bg-gradient-to-r from-gray-100/80 to-gray-50/80 backdrop-blur-md py-2 px-4 z-10">
                        <h3 className="font-medium text-xs text-gray-600">
                          {date}
                        </h3>
                      </div>
                      <div className="px-2">
                        {items.map((notification) => {
                          const styles = getStylesByType(notification.type);
                          return (
                            <motion.div
                              key={notification.id}
                              className={`py-3 border-b ${styles.borderColor} ${
                                !notification.isRead
                                  ? "bg-gradient-to-r " + styles.bgGradient
                                  : "hover:bg-gray-50/50"
                              } rounded-xl my-1 mx-2 px-3 relative overflow-hidden cursor-pointer`}
                              onClick={() =>
                                setSelectedNotification(notification)
                              }
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-center">
                                <div className="relative">
                                  <div
                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${styles.iconGradient} flex items-center justify-center mr-3 flex-shrink-0 text-white`}
                                  >
                                    <span className="text-lg">
                                      {getIconByType(notification)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-grow pr-2">
                                  <div
                                    className={`font-medium text-sm ${
                                      !notification.isRead
                                        ? styles.textColor
                                        : ""
                                    }`}
                                  >
                                    {notification.title}
                                  </div>
                                  <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                                    {notification.message}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="ml-1 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex-shrink-0 mt-1"></div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <motion.div
                    className="flex flex-col items-center justify-center h-full py-16 px-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                        <span className="text-2xl">📭</span>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-gray-100 blur-xl -z-10 opacity-50"></div>
                    </div>
                    <p className="text-base font-medium mb-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Boîte de réception vide
                    </p>
                    <p className="text-xs text-gray-500 text-center max-w-xs">
                      Nous vous avertirons ici dès que vous recevrez de
                      nouvelles notifications.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Detail modal for notification */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </>
  );
}

