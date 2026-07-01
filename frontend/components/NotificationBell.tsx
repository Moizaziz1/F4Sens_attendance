import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Welcome to F4sens Attendance",
    message: "Your account has been created successfully. Start by checking in for today!",
    type: "success",
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Monthly Report Available",
    message: "Your February attendance report is now ready for download.",
    type: "info",
    read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "Late Check-in Reminder",
    message: "You checked in 15 minutes late today. Please ensure timely arrival.",
    type: "warning",
    read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return (
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case "warning":
      return (
        <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case "error":
      return (
        <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

const getNotificationBg = (type: Notification["type"]) => {
  switch (type) {
    case "info": return "bg-primary/10";
    case "success": return "bg-accent/10";
    case "warning": return "bg-warning/10";
    case "error": return "bg-danger/10";
    default: return "bg-primary/10";
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function NotificationBell({ unreadCount }: { unreadCount: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [bellShake, setBellShake] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = async () => {
    setBellShake(true);
    setTimeout(() => setBellShake(false), 500);
    setIsOpen(!isOpen);
    if (!isOpen) {
      await fetch("/api/notifications/read-all", { method: "POST" });
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    } catch {
      // Ignore error
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleClick}
        className="relative p-2 rounded-xl text-text-secondary hover:bg-surface-dark hover:text-text-primary transition-colors"
        aria-label={isOpen ? "Close notifications" : "Open notifications"}
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 ${bellShake ? "animate-wiggle" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger rounded-full text-xs w-5 h-5 flex items-center justify-center text-white font-medium animate-bounce-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-surface-dark overflow-hidden animate-scale-in z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-dark">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
            {notifications.some((n) => !n.read) && (
              <button
                onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                className="text-sm text-primary hover:text-primary-light font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-text-secondary">No notifications yet</p>
                <p className="text-text-muted text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              <ul className="divide-y divide-surface-dark" role="list">
                {notifications.map((notification, index) => (
                  <li
                    key={notification.id}
                    className={`p-4 hover:bg-surface/50 transition-colors animate-slide-up ${!notification.read ? "bg-primary/5" : ""}`}
                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "both" }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); if (!notification.read) markAsRead(notification.id); }}
                      className="w-full flex gap-3 text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationBg(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-medium text-sm ${!notification.read ? "text-text-primary" : "text-text-secondary"}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-text-muted whitespace-nowrap">{formatTime(notification.created_at)}</span>
                        </div>
                        <p className="text-sm text-text-secondary mt-1 line-clamp-2">{notification.message}</p>
                        {!notification.read && (
                          <span className="inline-block mt-2 text-xs text-primary font-medium">New</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-3 border-t border-surface-dark bg-surface/50">
            <button
              onClick={(e) => { e.stopPropagation(); toast.success("View all notifications coming soon"); }}
              className="w-full text-sm text-primary hover:text-primary-light font-medium transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}