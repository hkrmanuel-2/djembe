import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCheck } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { getNotificationIcon, getNotificationLink } from "@/lib/notificationApi";
import { useNavigate } from "react-router-dom";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const { userProfile, userType } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const userId =
    userType === "teacher"
      ? userProfile?.teacher_id
      : userProfile?.student_id;

  // Format relative time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Group notifications by time period
  const groupNotifications = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: { [key: string]: any[] } = {
      today: [],
      thisWeek: [],
      older: [],
    };

    notifications.forEach((notification) => {
      const date = new Date(notification.created_at);
      if (date >= today) {
        groups.today.push(notification);
      } else if (date >= weekAgo) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    const link = getNotificationLink(notification.type, notification.data);
    onClose();
    navigate(link);
  };

  const groups = groupNotifications();

  const renderNotificationGroup = (title: string, items: any[]) => {
    if (items.length === 0) return null;

    return (
      <div key={title}>
        <div className="px-5 py-2 sticky top-0" style={{ backgroundColor: "rgba(26, 43, 74, 0.98)" }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
            {title}
          </span>
        </div>
        {items.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`px-5 py-4 cursor-pointer transition-colors hover:bg-white/5 border-b ${
              !notification.read ? "bg-white/[0.03]" : ""
            }`}
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div className="flex gap-4">
              <span className="text-2xl flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={`text-sm font-medium leading-snug ${
                      notification.read ? "text-white/70" : "text-white"
                    }`}
                  >
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: "#D97746" }}
                    />
                  )}
                </div>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {notification.message}
                </p>
                <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {formatTime(notification.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full z-50 w-full sm:w-[420px] flex flex-col shadow-2xl"
            style={{ backgroundColor: "rgba(26, 43, 74, 0.98)", backdropFilter: "blur(20px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-white/80" />
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span
                    className="px-2 py-0.5 text-xs font-bold text-white rounded-full"
                    style={{ backgroundColor: "#D97746" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead(userId, userType)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div
                    className="w-8 h-8 border-2 rounded-full animate-spin mb-3"
                    style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "#D97746" }}
                  />
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 px-8 text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <Bell size={28} style={{ color: "rgba(255,255,255,0.2)" }} />
                  </div>
                  <p className="text-base font-medium text-white mb-1">All caught up!</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                    No notifications yet. Check back later.
                  </p>
                </div>
              ) : (
                <div className="pb-4">
                  {renderNotificationGroup("Today", groups.today)}
                  {renderNotificationGroup("This Week", groups.thisWeek)}
                  {renderNotificationGroup("Earlier", groups.older)}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Showing {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
