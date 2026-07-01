"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import toast from "react-hot-toast";
import AttendanceCard from "../../components/AttendanceCard";
import { useAuth } from "../../lib/auth-context";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [today, setToday] = useState<string>("");
  const [status, setStatus] = useState<string>("absent");
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [pakistanTime, setPakistanTime] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setPakistanTime(now.toLocaleTimeString("en-US", options));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchToday = async () => {
    try {
      const res = await api.get("/attendance/today");
      const data = res.data;
      console.log("fetchToday data:", data);
      setToday(data.date);
      setStatus(data.status);
      setCheckInTime(data.check_in);
      setCheckOutTime(data.check_out);
    } catch (err: any) {
      console.error("fetchToday error:", err.response?.data || err.message);
      toast.error("Failed to load today's attendance");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleCheckIn = async () => {
    try {
      await api.post("/attendance/checkin", {});
      toast.success("Checked in successfully");
      fetchToday();
    } catch (err: any) {
      console.error("Check-in error:", err.response?.data || err.message);
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map((e: any) => e.msg).join(", ") : (detail || "Check-in failed");
      toast.error(msg);
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post("/attendance/checkout", {});
      toast.success("Checked out successfully");
      fetchToday();
    } catch (err: any) {
      console.error("Check-out error:", err.response?.data || err.message);
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail.map((e: any) => e.msg).join(", ") : (detail || "Check-out failed");
      toast.error(msg);
    }
  };

  const getGreeting = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Karachi",
      hour: "2-digit",
      hour12: false,
    };
    const hour = parseInt(now.toLocaleTimeString("en-US", options), 10);
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 22) return "Good Evening";
    return "Good Night";
  };

  const getStatusConfig = (s: string) => {
    switch (s) {
      case "present":
        return { label: "Present", color: "success", icon: "check-circle" };
      case "late":
        return { label: "Late", color: "warning", icon: "clock" };
      case "absent":
        return { label: "Not Checked In", color: "neutral", icon: "circle" };
      default:
        return { label: s, color: "neutral", icon: "circle" };
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
          <span className="text-text-secondary">Loading...</span>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="animate-fade-in">
        <div className="card animate-pulse">
          <div className="card-body space-y-4">
            <div className="h-8 bg-surface-dark rounded w-1/4" />
            <div className="h-32 bg-surface-dark rounded" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-surface-dark rounded" />
              <div className="h-20 bg-surface-dark rounded" />
              <div className="h-20 bg-surface-dark rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="hero-card p-8 md:p-10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-text-inverse/80 text-sm font-medium mb-1">{getGreeting()}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Employee Dashboard</h1>
          <p className="text-text-inverse/70">
            {format(new Date(today || new Date()), "EEEE, MMMM d, yyyy")}
          </p>
          <div className="flex items-center gap-2 mt-3 text-text-inverse/80 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono font-semibold">{pakistanTime}</span>
            <span className="text-text-inverse/60">PKT</span>
          </div>
        </div>
      </div>

      <div className="grid-responsive mb-8">
        <div className="card animate-slide-up stagger-1" style={{ animationFillMode: "both" }}>
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary text-sm font-medium">Today&apos;s Status</span>
              <span className={`badge badge-${getStatusConfig(status).color}`}>{getStatusConfig(status).label}</span>
            </div>
            <AttendanceCard date={today || new Date().toISOString()} status={status} />
          </div>
        </div>

        <div className="card hover-lift animate-slide-up stagger-2" style={{ animationFillMode: "both" }}>
          <div className="card-body">
            <h3 className="text-text-secondary text-sm font-medium mb-4">Check-in Time</h3>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse-glow">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {checkInTime ? format(new Date(checkInTime), "h:mm a") : "\u2014"}
                </p>
                <p className="text-sm text-text-muted">{checkInTime ? "Checked in" : "Not checked in yet"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card hover-lift animate-slide-up stagger-3" style={{ animationFillMode: "both" }}>
          <div className="card-body">
            <h3 className="text-text-secondary text-sm font-medium mb-4">Check-out Time</h3>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {checkOutTime ? format(new Date(checkOutTime), "h:mm a") : "\u2014"}
                </p>
                <p className="text-sm text-text-muted">{checkOutTime ? "Checked out" : "Still working"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-gradient mb-8">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
            {status === "absent" && (
              <button
                onClick={handleCheckIn}
                className="btn-success btn-lg w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check In
              </button>
            )}
            {checkInTime && !checkOutTime && (
              <button
                onClick={handleCheckOut}
                className="btn-primary btn-lg w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Check Out
              </button>
            )}
            {checkOutTime && (
              <button
                disabled
                className="btn-secondary btn-lg w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completed for Today
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-semibold text-text-primary">Quick Actions</h2>
          <div className="flex-1 h-px bg-surface-dark" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/reports" className="card hover-lift animate-slide-up stagger-4" style={{ animationFillMode: "both" }}>
            <div className="card-body text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary">My Reports</h3>
              <p className="text-sm text-text-muted mt-1">View attendance history</p>
            </div>
          </Link>
          <Link href="/dashboard/notifications" className="card hover-lift animate-slide-up stagger-5" style={{ animationFillMode: "both" }}>
            <div className="card-body text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 transition-transform duration-300 hover:scale-110 hover:-rotate-3">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary">Notifications</h3>
              <p className="text-sm text-text-muted mt-1">Check announcements</p>
            </div>
          </Link>
          <button className="card hover-lift animate-slide-up stagger-6" style={{ animationFillMode: "both" }} onClick={() => toast.success("Profile settings coming soon")}>
            <div className="card-body text-center">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-3 transition-transform duration-300 hover:scale-110 hover:rotate-6">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.756.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary">Settings</h3>
              <p className="text-sm text-text-muted mt-1">Manage preferences</p>
            </div>
          </button>
          <button className="card hover-lift animate-slide-up" style={{ animationDelay: "0.35s", animationFillMode: "both" }} onClick={() => toast.success("Help center coming soon")}>
            <div className="card-body text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary-dark flex items-center justify-center mx-auto mb-3 transition-transform duration-300 hover:scale-110 hover:-rotate-6">
                <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary">Help</h3>
              <p className="text-sm text-text-muted mt-1">Get support</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
