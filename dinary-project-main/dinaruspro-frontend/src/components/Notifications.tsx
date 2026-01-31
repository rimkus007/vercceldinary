"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/components/common/NotificationsContext";
import NotificationsPanel from "@/components/modals/NotificationsPanel";

export default function Notifications() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: any) => {
    // La logique de navigation est gérée dans le NotificationDetailModal
    void 0;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-full bg-yellow-100 shadow-md hover:bg-yellow-200 transition-colors"
      >
        <Bell className="w-6 h-6 text-yellow-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={markAllAsRead}
        onNotificationClick={handleNotificationClick}
      />
    </>
  );
}
