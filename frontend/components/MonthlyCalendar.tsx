import React from "react";
import { eachDayOfInterval, isWeekend, format, isSameMonth } from "date-fns";

type DayStatus = "present" | "absent" | "late" | "weekend" | "empty";

type Day = {
  date: Date;
  status: DayStatus;
};

const statusStyles: Record<DayStatus, { bg: string; text: string; border: string }> = {
  present: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  late: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
  absent: { bg: "bg-danger/10", text: "text-danger", border: "border-danger/20" },
  weekend: { bg: "bg-surface", text: "text-text-muted", border: "border-surface-dark" },
  empty: { bg: "bg-transparent", text: "text-text-muted", border: "border-surface-dark/50" },
};

const statusLabels: Record<DayStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  weekend: "Weekend",
  empty: "No Data",
};

interface MonthlyCalendarProps {
  year: number;
  month: number;
  records: Record<string, string>;
}

export default function MonthlyCalendar({ year, month, records }: MonthlyCalendarProps) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  const firstDayOfWeek = start.getDay();
  const daysInMonth = end.getDate();

  const days: Day[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ date: new Date(year, month - 1, -firstDayOfWeek + i + 1), status: "empty" });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const key = format(date, "yyyy-MM-dd");
    let status: Day["status"] = "absent";

    if (isWeekend(date)) {
      status = "weekend";
    } else if (records[key]) {
      status = records[key] as DayStatus;
    }

    days.push({ date, status });
  }

  const totalCells = Math.ceil(days.length / 7) * 7;
  while (days.length < totalCells) {
    const nextDate = new Date(year, month - 1, daysInMonth + days.length - totalCells + 1);
    days.push({ date: nextDate, status: "empty" });
  }

  const legendItems: { status: DayStatus; label: string }[] = [
    { status: "present", label: "Present" },
    { status: "late", label: "Late" },
    { status: "absent", label: "Absent" },
    { status: "weekend", label: "Weekend" },
  ];

  return (
    <div className="card overflow-hidden animate-scale-in">
      <div className="card-body p-0">
        <div className="grid grid-cols-7 border-b border-surface-dark">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <div key={day} className={`p-3 text-center text-xs font-semibold text-text-secondary bg-surface/50 animate-slide-down stagger-${i + 1}`} style={{ animationFillMode: "both" }}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const styles = statusStyles[day.status];
            const isToday = format(day.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const isCurrentMonth = isSameMonth(day.date, start);

            return (
              <div
                key={`${day.date.toISOString()}-${index}`}
                className={`
                  aspect-square flex flex-col items-center justify-center
                  border-r border-b ${styles.border}
                  transition-all duration-200 hover:bg-surface/80 hover:scale-105 cursor-default
                  animate-pop
                  ${isCurrentMonth ? "" : "opacity-50"}
                  ${isToday ? "ring-2 ring-primary ring-inset shadow-inner" : ""}
                `}
                style={{ animationDelay: `${Math.min(index * 0.02, 0.8)}s`, animationFillMode: "both" }}
              >
                <span className={`text-sm font-medium ${styles.text} ${isToday ? "font-bold" : ""}`}>
                  {format(day.date, "d")}
                </span>
                {day.status !== "empty" && day.status !== "weekend" && (
                  <span className={`text-xs mt-0.5 px-1.5 py-0.5 rounded-full ${styles.bg} ${styles.text}`}>
                    {statusLabels[day.status]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="card-footer border-t border-surface-dark bg-white">
        <div className="flex flex-wrap items-center gap-3 justify-center">
          {legendItems.map((item, i) => {
            const styles = statusStyles[item.status];
            return (
              <span key={item.status} className={`flex items-center gap-1.5 text-sm text-text-secondary animate-fade-in stagger-${i + 1}`} style={{ animationFillMode: "both" }}>
                <span className={`w-3 h-3 rounded ${styles.bg} ${styles.border}`} />
                {item.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
