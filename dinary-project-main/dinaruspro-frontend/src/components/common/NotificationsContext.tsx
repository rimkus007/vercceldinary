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

// --- Interfaces ---
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

// --- Formatage ---
const formatApiNotification = (notif: ApiNotification): Notification => {
  let title = "Notification";
  let type: Notification["type"] = "system";
  let icon = notif.emoji || "🔔"; // Utiliser l'emoji de l'API par défaut
  
  // ✅ CORRECTION: Détecter le type en fonction du message
  if (notif.message.toLowerCase().includes("vérifié")) {
    title = "Identité Vérifiée";
    type = "reward";
    if (!notif.emoji) icon = "🎉";
  } else if (notif.message.toLowerCase().includes("approuvée") || notif.message.toLowerCase().includes("approuvé")) {
    title = "Demande Approuvée";
    type = "transaction";
    if (!notif.emoji) icon = "✅";
  } else if (notif.message.toLowerCase().includes("rejetée") || notif.message.toLowerCase().includes("rejeté")) {
    title = "Demande Rejetée";
    type = "alert";
    if (!notif.emoji) icon = "❌";
  } else if (notif.message.toLowerCase().includes("retrait")) {
    title = "Retrait";
    type = "transaction";
    if (!notif.emoji) icon = "💰";
  } else if (notif.message.toLowerCase().includes("paiement")) {
    title = "Paiement Reçu";
    type = "transaction";
    if (!notif.emoji) icon = "💳";
  } else if (notif.message.toLowerCase().includes("xp")) {
    title = "Bonus XP";
    type = "reward";
    if (!notif.emoji) icon = "⭐";
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
    link: "/dashboard",
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
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/me/notifications`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/me/chat`,
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
            emoji: "💬",
            link: "/support",
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
    if (token) {
      fetchNotifications(token);
      checkAdminMessages(token);
      intervalRef.current = setInterval(() => {
        fetchNotifications(token);
        checkAdminMessages(token);
      }, 5000); // Vérification toutes les 5 secondes
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token, fetchNotifications, checkAdminMessages]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    
    try {
      // Marquer toutes comme lues dans l'UI immédiatement
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      
      // Envoyer la requête au backend pour persister
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/me/notifications/mark-all-read`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      void 0;
    }
  }, [token]);

  const deleteAllNotifications = useCallback(async () => {
    if (!token) return;
    
    try {
      // Supprimer toutes dans l'UI immédiatement
      setNotifications([]);
      
      // Envoyer la requête au backend pour persister
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/me/notifications`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      void 0;
      // En cas d'erreur, recharger les notifications
      if (token) fetchNotifications(token);
    }
  }, [token, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAllAsRead, deleteAllNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

