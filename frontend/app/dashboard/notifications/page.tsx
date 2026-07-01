"use client";
import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      toast.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.post(`/notifications/read/${id}`);
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay up to date with announcements</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={markAllRead} className="btn-primary">
            Mark All Read
          </button>
        )}
      </header>

      <div className="card">
        <div className="card-body p-0">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-text-primary mb-1">No notifications</h3>
              <p className="text-text-secondary">You're all caught up!</p>
            </div>
          ) : (
            <ul className="divide-y divide-surface-dark">
              {notifications.map((n) => (
                <li key={n.id} className={`p-4 ${!n.is_read ? "bg-primary/5" : ""}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={`text-text-primary ${!n.is_read ? "font-medium" : ""}`}>{n.message}</p>
                      <p className="text-sm text-text-muted mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="btn-ghost px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
