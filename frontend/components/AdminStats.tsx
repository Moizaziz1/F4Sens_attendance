import React from "react";

interface AdminStatsProps {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
}

const statsConfig = [
  {
    key: "totalEmployees",
    label: "Total Employees",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: "primary",
    bg: "bg-primary/10",
    trend: null,
  },
  {
    key: "presentToday",
    label: "Present Today",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    color: "accent",
    bg: "bg-accent/10",
    trend: { value: 12, label: "vs yesterday" },
  },
  {
    key: "absentToday",
    label: "Absent Today",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    color: "danger",
    bg: "bg-danger/10",
    trend: { value: 3, label: "vs yesterday" },
  },
  {
    key: "lateToday",
    label: "Late Today",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "warning",
    bg: "bg-warning/10",
    trend: { value: 2, label: "vs yesterday" },
  },
] as const;

export default function AdminStats({ totalEmployees, presentToday, absentToday, lateToday }: AdminStatsProps) {
  const stats = [
    { ...statsConfig[0], value: totalEmployees },
    { ...statsConfig[1], value: presentToday },
    { ...statsConfig[2], value: absentToday },
    { ...statsConfig[3], value: lateToday },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.key}
          className={`card hover-lift animate-slide-up stagger-${index + 1}`}
          style={{ animationFillMode: "both" }}
        >
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-text-primary">
                  {stat.value.toLocaleString()}
                </p>
                {stat.trend && (
                  <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                    <span className="text-warning animate-float">▲</span>
                    <span>{stat.trend.value}% {stat.trend.label}</span>
                  </p>
                )}
              </div>
              <div className={`${stat.bg} rounded-xl p-3 animate-pop`} style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                <span className={`text-${stat.color}`}>{stat.icon}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
