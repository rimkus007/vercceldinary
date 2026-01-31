"use client";
import React, { useState, Suspense } from "react";
import { useNotifications } from "@/components/common/NotificationsContext";

const NotificationsPanel = React.lazy(
  () => import("@/components/modals/NotificationsPanel")
);

export default function GlobalNotificationsModal() {
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const { notifications, markAllAsRead } = useNotifications();

  // Expose a global function to open the modal (for Header)
  React.useEffect(() => {
    window.openNotificationsModal = () => setNotificationsOpen(true);
    return () => {
      delete window.openNotificationsModal;
    };
  }, []);

  const handleNotificationClick = (notification: any) => {
    setNotificationsOpen(false);
  };

  return (
    <Suspense fallback={null}>
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={markAllAsRead}
        onNotificationClick={handleNotificationClick}
      />
    </Suspense>
  );
}
