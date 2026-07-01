"use client";
import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  is_active: boolean;
  role: string;
  created_at: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/admin/employees");
      setEmployees(res.data);
    } catch (err) {
      toast.error("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/admin/employees/${id}`, { is_active: !isActive });
      fetchEmployees();
      toast.success(`Employee ${!isActive ? "activated" : "deactivated"}`);
    } catch (err) {
      toast.error("Failed to update employee");
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage employee accounts and access</p>
        </div>
        <button className="btn-primary" onClick={() => toast.success("Add employee feature coming soon")}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Employee
        </button>
      </header>

      <div className="card">
        <div className="card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="card-body p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-text-secondary">Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-text-primary mb-1">No employees found</h3>
              <p className="text-text-secondary">{search ? "Try adjusting your search" : "No employees have been added yet"}</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3 hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Department</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 hidden md:table-cell">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((e) => (
                    <tr key={e.id} className="border-t border-surface-dark/50 hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {e.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{e.name}</p>
                            <p className="text-xs text-text-muted hidden sm:block">{e.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-text-secondary">{e.email}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-text-secondary">{e.department || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-primary">{e.role.replace("_", " ")}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${e.is_active ? "badge-success" : "badge-neutral"}`}>
                          {e.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-text-muted text-sm">
                        {format(new Date(e.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleActive(e.id, e.is_active)}
                          className="btn-ghost px-3 py-1.5 text-sm"
                        >
                          {e.is_active ? "Deactivate" : "Activate"}
                        </button>
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