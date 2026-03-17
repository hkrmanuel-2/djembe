import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  realtimeChannel: null,

  // Load notifications for current user
  loadNotifications: async (userId, userType) => {
    if (!userId || !userType) {
      logger.log("[NOTIFICATIONS] Skipped load - missing userId or userType:", { userId, userType });
      return;
    }

    logger.log("[NOTIFICATIONS] Loading for:", { userId, userType });
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", userId)
        .eq("recipient_type", userType)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("[NOTIFICATIONS] Load error:", error);
        throw error;
      }

      logger.log("[NOTIFICATIONS] Loaded:", data?.length ?? 0, "notifications");
      const unreadCount = data?.filter((n) => !n.read).length || 0;

      set({
        notifications: data || [],
        unreadCount,
        isLoading: false,
      });
    } catch (error) {
      console.error("[NOTIFICATIONS] Load notifications error:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Subscribe to real-time notifications
  subscribeToNotifications: (userId, userType) => {
    if (!userId) return;

    // Unsubscribe from any existing channel first
    get().unsubscribe();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new;

          // Only add if it matches the user type
          if (newNotification.recipient_type === userType) {
            set((state) => ({
              notifications: [newNotification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            }));

            // Show browser notification if permitted
            get().showBrowserNotification(newNotification);
          }
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  // Unsubscribe from real-time
  unsubscribe: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null });
    }
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId, userType) => {
    if (!userId || !userType) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("recipient_id", userId)
        .eq("recipient_type", userType)
        .eq("read", false);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read: true,
          read_at: n.read_at || new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  },

  // Show browser notification
  showBrowserNotification: (notification) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
          tag: notification.id, // Prevent duplicate notifications
        });
      }
    }
  },

  // Request browser notification permission
  requestNotificationPermission: async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
  },

  // Reset store (on logout)
  reset: () => {
    get().unsubscribe();
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      realtimeChannel: null,
    });
  },
}));
