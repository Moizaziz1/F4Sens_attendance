'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import AdminStats from "../../components/AdminStats";
import { format } from "date-fns";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalEmployees: 0, presentToday: 0, absentToday: 0, lateToday: 0 });
  const [pakistanTime, setPakistanTime] = useState("");

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

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      const data = res.data;
      setStats({
        totalEmployees: data.total_employees ?? 0,
        presentToday: data.present_today ?? 0,
        absentToday: data.absent_today ?? 0,
        lateToday: data.late_today ?? 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: "include" });
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const user = await res.json();
        if (user.role !== "admin") {
          router.replace("/login");
          return;
        }
      } catch (_) {
        router.replace("/login");
        return;
      }
      fetchStats();
    };
    check();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="hero-card p-8 md:p-10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-text-inverse/80 text-sm font-medium mb-1">Admin Panel</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-text-inverse/70">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
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
      <AdminStats {...stats} />
    </div>
  );
}
