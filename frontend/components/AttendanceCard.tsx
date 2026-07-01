import React from "react";
import { format } from "date-fns";

type StatusConfig = {
  label: string;
  bg: string;
  text: string;
  icon: React.ReactNode;
};

const statusConfigs: Record<string, StatusConfig> = {
  present: {
    label: "Present",
    bg: "bg-accent",
    text: "text-white",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  late: {
    label: "Late",
    bg: "bg-warning",
    text: "text-white",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  absent: {
    label: "Absent",
    bg: "bg-danger",
    text: "text-white",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  weekend: {
    label: "Weekend",
    bg: "bg-surface-dark",
    text: "text-text-muted",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9H9a2 2 0 010-4h11a7 7 0 10-7-7v4" />
      </svg>
    ),
  },
};

interface AttendanceCardProps {
  date: string;
  status: string;
  showDate?: boolean;
}

export default function AttendanceCard({ date, status, showDate = true }: AttendanceCardProps) {
  const config = statusConfigs[status] || statusConfigs.absent;

  return (
    <div className={`rounded-xl p-5 flex items-center gap-4 ${config.bg} ${config.text} shadow-soft hover-lift animate-slide-in-left`}>
      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-bounce-in">
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        {showDate && (
          <div className="text-sm opacity-90 mb-1">
            {format(new Date(date), "EEEE, MMMM d, yyyy")}
          </div>
        )}
        <div className="text-lg font-semibold">{config.label}</div>
      </div>
    </div>
  );
}
