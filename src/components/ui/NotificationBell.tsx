import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import NotificationPanel from "./NotificationPanel";

export default function NotificationBell() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { userProfile, userType } = useAuthStore();
  const {
    unreadCount,
    loadNotifications,
    subscribeToNotifications,
    unsubscribe,
    requestNotificationPermission,
  } = useNotificationStore();

  // Get user ID based on type
  const userId =
    userType === "teacher"
      ? userProfile?.teacher_id
      : userProfile?.student_id;

  // Load and subscribe to notifications on mount
  useEffect(() => {
    if (userId && userType) {
      loadNotifications(userId, userType);
      subscribeToNotifications(userId, userType);
      requestNotificationPermission();
    }

    return () => unsubscribe();
  }, [userId, userType]);

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={() => setIsPanelOpen(true)}
        className="relative p-2 rounded-full transition-colors hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-white/80" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
            style={{ backgroundColor: "#D97746" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
}
