"use client";
import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import toast from "react-hot-toast";
import MonthlyCalendar from "../../../components/MonthlyCalendar";
import { useAuth } from "../../../lib/auth-context";

export default function ReportsPage() {
  const { user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [records, setRecords] = useState<Record<string, string>>({});

  const fetchReport = async () => {
    if (!user) return;
    try {
      const res = await api.get("/reports/monthly", {
        params: { user_id: user.id, month, year },
      });
      const rec: Record<string, string> = {};
      res.data.records.forEach((r: any) => {
        rec[r.date] = r.status;
      });
      setRecords(rec);
    } catch (err) {
      toast.error("Failed to load report");
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year, user]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Monthly Attendance Report</h1>
      <div className="flex space-x-2 mb-4">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="p-2 border rounded"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="p-2 border rounded"
        >
          {[...Array(5)].map((_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>{y}</option>
            );
          })}
        </select>
      </div>
      <MonthlyCalendar year={year} month={month} records={records} />
    </div>
  );
}
