"use client";
import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  date: string;
  user_id: string;
  user_name: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  note: string | null;
}

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (userId) params.user_id = userId;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get("/admin/attendance", { params });
      setRecords(res.data);
    } catch (err) {
      toast.error("Failed to load attendance records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const updateRecord = async (id: string, updates: any) => {
    try {
      await api.patch(`/admin/attendance/${id}`, updates);
      fetchRecords();
      toast.success("Attendance updated");
    } catch (err) {
      toast.error("Failed to update attendance");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <span className="badge badge-success">Present</span>;
      case "late":
        return <span className="badge badge-warning">Late</span>;
      case "absent":
        return <span className="badge badge-danger">Absent</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Attendance Management</h1>
        <p className="page-subtitle">View and manage employee attendance records</p>
      </header>

      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="input flex-1"
            />
            <input
              type="date"
              placeholder="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input w-full sm:w-48"
            />
            <input
              type="date"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input w-full sm:w-48"
            />
            <button onClick={fetchRecords} className="btn-primary whitespace-nowrap">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 012-2h10a2 2 0 012 2" />
              </svg>
              Filter
            </button>
            <button onClick={() => { setUserId(""); setFrom(""); setTo(""); fetchRecords(); }} className="btn-secondary whitespace-nowrap">
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-text-secondary">Loading attendance records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="text-text-primary mb-1">No records found</h3>
              <p className="text-text-secondary">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Check-In</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Check-Out</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 hidden md:table-cell">Note</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-t border-surface-dark/50 hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {format(new Date(r.date), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-text-primary">{r.user_name}</p>
                          <p className="text-xs text-text-muted">{r.user_id.slice(0, 8)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-text-secondary">
                        {r.check_in ? format(new Date(`2000-01-01T${r.check_in}`), "h:mm a") : "—"}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-text-secondary">
                        {r.check_out ? format(new Date(`2000-01-01T${r.check_out}`), "h:mm a") : "—"}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-text-muted text-sm max-w-xs truncate">
                        {r.note || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={r.status}
                            onChange={(e) => updateRecord(r.id, { status: e.target.value })}
                            className="input input-sm py-1.5 px-3 text-sm"
                          >
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                            <option value="absent">Absent</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
