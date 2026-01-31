"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "@/context/AuthContext";

// --- Interfaces (inchangées) ---
interface ApiNotification {
  id: string;
  message: string;
  emoji?: string;
  isRead: boolean;
  createdAt: string;
}
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "transaction" | "reward" | "promo" | "system" | "alert";
  isRead: boolean;
  timestamp: string;
  link?: string;
  icon?: string;
  emoji?: string;
}
interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => void;
  deleteAllNotifications: () => void;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications doit être utilisé à l'intérieur d'un NotificationsProvider"
    );
  }
  return context;
};

// --- Formatage (inchangé) ---
const formatApiNotification = (notif: ApiNotification): Notification => {
  let title = "Notification";
  let type: Notification["type"] = "system";
  let icon = notif.emoji || "🔔"; // Utiliser l'emoji de l'API par défaut
  
  // ✅ CORRECTION: Détecter le type en fonction du message
  // Si message contient "vérifié" → vérification identité
  if (notif.message.toLowerCase().includes("vérifié")) {
    title = "Identité Vérifiée";
    type = "reward";
    if (!notif.emoji) icon = "🎉";
  } else if (notif.message.toLowerCase().includes("approuvée")) {
    title = "Recharge Approuvée";
    type = "transaction";
    if (!notif.emoji) icon = "✅";
  } else if (notif.message.toLowerCase().includes("rejetée")) {
    title = "Recharge Rejetée";
    type = "alert";
    if (!notif.emoji) icon = "❌";
  } else if (notif.message.toLowerCase().includes("bonus") || notif.message.toLowerCase().includes("xp")) {
    title = "Bonus Reçu";
    type = "reward";
    if (!notif.emoji) icon = "🎁";
  } else if (notif.message.toLowerCase().includes("message")) {
    title = "Nouveau Message";
    type = "system";
    if (!notif.emoji) icon = "💬";
  } else {
    title = "Notification";
  }
  
  return {
    id: notif.id,
    title,
    message: notif.message,
    type,
    isRead: notif.isRead,
    timestamp: notif.createdAt,
    icon,
    emoji: notif.emoji,
    link: "/historique",
  };
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { token } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef<number>(0);

  const fetchNotifications = useCallback(async (currentToken: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications`,
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );
      if (response.ok) {
        const data: ApiNotification[] = await response.json();
        setNotifications(data.map(formatApiNotification));
      }
    } catch (error) {
      void 0;
    }
  }, []);

  // Vérifier les nouveaux messages admin
  const checkAdminMessages = useCallback(async (currentToken: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/chat`,
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );
      if (response.ok) {
        const messages: any[] = await response.json();
        const adminMessages = messages.filter((msg) => msg.senderId === "admin");
        
        // Si c'est la première vérification, initialiser le compteur
        if (lastMessageCountRef.current === 0) {
          lastMessageCountRef.current = adminMessages.length;
          return;
        }
        
        // Si on a de nouveaux messages
        const newMessagesCount = adminMessages.length - lastMessageCountRef.current;
        if (newMessagesCount > 0) {
          const latestMessage = adminMessages[adminMessages.length - 1];
          
          // Créer une notification locale
          const messageNotification: Notification = {
            id: `admin-msg-${latestMessage.id}`,
            title: "💬 Nouveau message admin",
            message: latestMessage.content.substring(0, 100),
            type: "system",
            isRead: false,
            timestamp: latestMessage.timestamp || new Date().toISOString(),
            icon: "💬",
            link: "/support/chat",
          };
          
          // Ajouter la notification au début de la liste
          setNotifications((prev) => [messageNotification, ...prev]);
          
          void 0;
          
          // Mettre à jour le compteur
          lastMessageCountRef.current = adminMessages.length;
        }
      }
    } catch (error) {
      void 0;
    }
  }, []);

  useEffect(() => {
    const startPolling = (currentToken: string) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      fetchNotifications(currentToken);
      checkAdminMessages(currentToken);
      intervalRef.current = setInterval(
        () => {
          fetchNotifications(currentToken);
          checkAdminMessages(currentToken);
        },
        5000 // Vérification toutes les 5 secondes
      );
    };
    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      lastMessageCountRef.current = 0;
    };
    if (token) {
      startPolling(token);
    } else {
      stopPolling();
      setNotifications([]);
    }
    return () => stopPolling();
  }, [token, fetchNotifications, checkAdminMessages]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // --- 👇 VOICI LA CORRECTION 👇 ---
  const markAllAsRead = async () => {
    if (!token || unreadCount === 0) return;

    // 1. Mise à jour visuelle immédiate (inchangée)
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );

    // 2. Envoi de la requête au backend (corrigée)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: "PATCH",
        // On ajoute les en-têtes et un corps vide pour plus de robustesse
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}), // Un corps vide est parfois nécessaire
      });
    } catch (error) {
      void 0;
      // En cas d'erreur, on recharge les notifications pour annuler le changement visuel
      if (token) fetchNotifications(token);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!token) return;
    setNotifications([]); // Clear visually immediately
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/delete-all`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      void 0;
      // Reload notifications if error
      if (token) fetchNotifications(token);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAllAsRead,
    deleteAllNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
