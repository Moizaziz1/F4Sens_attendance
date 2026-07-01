"use client";
import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import toast from "react-hot-toast";
import MonthlyCalendar from "../../../components/MonthlyCalendar";

interface AdminReportData {
  summary: {
    total_employees: number;
    total_records: number;
    present_count: number;
    late_count: number;
    absent_count: number;
  };
  department_stats: Array<{
    department: string;
    present: number;
    late: number;
    absent: number;
    total: number;
  }>;
  records: Record<string, string>;
}

export default function AdminReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState<AdminReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/reports", { params: { month, year } });
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load admin reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  return (
    <div className="animate-fade-in">
      <header className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Company-wide Monthly Report</h1>
          <p className="page-subtitle">Overview of attendance across all departments</p>
        </div>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="input w-auto"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleString("default", { month: "long" })}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input w-auto"
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </header>

      {isLoading ? (
        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-surface-dark rounded-xl" />
              ))}
            </div>
            <div className="mt-6 h-96 bg-surface-dark rounded-xl" />
          </div>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-1">Total Employees</p>
                    <p className="text-3xl font-bold text-text-primary">{data.summary.total_employees.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-1">Present</p>
                    <p className="text-3xl font-bold text-accent">{data.summary.present_count.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-1">Late</p>
                    <p className="text-3xl font-bold text-warning">{data.summary.late_count.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-1">Absent</p>
                    <p className="text-3xl font-bold text-danger">{data.summary.absent_count.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-text-primary">Department Breakdown</h3>
              </div>
              <div className="card-body p-0">
                {data.department_stats.length === 0 ? (
                  <div className="p-6 text-center text-text-secondary">No department data available</div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th className="px-4 py-3">Department</th>
                          <th className="px-4 py-3 text-center">Present</th>
                          <th className="px-4 py-3 text-center">Late</th>
                          <th className="px-4 py-3 text-center">Absent</th>
                          <th className="px-4 py-3 text-center">Total</th>
                          <th className="px-4 py-3 text-center">Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.department_stats.map((dept) => (
                          <tr key={dept.department} className="border-t border-surface-dark/50 hover:bg-surface/50">
                            <td className="px-4 py-3 font-medium text-text-primary">{dept.department || "Unassigned"}</td>
                            <td className="px-4 py-3 text-center text-accent font-medium">{dept.present}</td>
                            <td className="px-4 py-3 text-center text-warning font-medium">{dept.late}</td>
                            <td className="px-4 py-3 text-center text-danger font-medium">{dept.absent}</td>
                            <td className="px-4 py-3 text-center text-text-secondary">{dept.total}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="badge badge-primary">
                                {dept.total > 0 ? Math.round((dept.present / dept.total) * 100) : 0}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-text-primary">Monthly Calendar View</h3>
              </div>
              <div className="card-body">
                <MonthlyCalendar year={year} month={month} records={data.records} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-text-primary">Raw Data Export</h3>
            </div>
            <div className="card-body">
              <pre className="bg-surface-dark p-4 rounded-xl text-sm text-text-secondary overflow-x-auto max-h-64">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <p className="text-text-secondary">No data available</p>
          </div>
        </div>
      )}
    </div>
  );
}
