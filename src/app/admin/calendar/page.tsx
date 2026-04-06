"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Booking } from "@/lib/types";
import { getServiceName } from "@/lib/services";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const statusDot: Record<string, string> = {
  pending: "bg-yellow-400",
  approved: "bg-green-400",
  rejected: "bg-red-400",
};

export default function AdminCalendarPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", { headers: { "x-admin-password": password } });
      if (!res.ok) {
        if (res.status === 401) { setIsAuthenticated(false); throw new Error("Invalid password"); }
        throw new Error("Failed to fetch");
      }
      setBookings(await res.json());
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  }, [password]);

  useEffect(() => { if (isAuthenticated) fetchBookings(); }, [isAuthenticated, fetchBookings]);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    }
    return map;
  }, [bookings]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    setSelectedDay(null);
  }

  const selectedBookings = selectedDay ? (bookingsByDate[selectedDay] || []) : [];

  // Login
  if (!isAuthenticated) {
    return (
      <div className="max-w-sm mx-auto py-20 px-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-center text-white mb-6">Admin Calendar</h1>
        <form onSubmit={(e) => { e.preventDefault(); setIsAuthenticated(true); }} className="glass-card p-6 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter admin password" className="w-full px-4 py-2.5 input-dark" />
          </div>
          <button type="submit" className="w-full py-2.5 btn-gold">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <a href="/admin" className="text-[var(--text-muted)] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
        </div>
        <button onClick={fetchBookings} disabled={loading} className="text-sm px-4 py-2 rounded-xl border border-white/10 text-[var(--text-muted)] hover:bg-white/5 transition-colors disabled:opacity-50">
          {loading ? "..." : "Refresh"}
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-white">{monthName}</h2>
        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="glass-card p-4 mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-[var(--text-muted)] py-2">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(viewYear, viewMonth, day);
            const dayBookings = bookingsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDay;
            const isPast = new Date(dateStr) < new Date(todayStr);

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-sm transition-all relative ${
                  isSelected
                    ? "bg-gold/20 border border-gold/40"
                    : isToday
                    ? "border border-gold/30 bg-gold/5"
                    : "hover:bg-white/5 border border-transparent"
                } ${isPast ? "opacity-50" : ""}`}
              >
                <span className={`font-medium ${isToday ? "text-gold" : isSelected ? "text-white" : "text-[var(--text)]"}`}>
                  {day}
                </span>
                {dayBookings.length > 0 && (
                  <div className="flex gap-0.5">
                    {dayBookings.slice(0, 3).map((b, idx) => (
                      <span key={idx} className={`w-1.5 h-1.5 rounded-full ${statusDot[b.status] || "bg-gray-400"}`} />
                    ))}
                    {dayBookings.length > 3 && (
                      <span className="text-[8px] text-[var(--text-muted)]">+{dayBookings.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day bookings */}
      {selectedDay && (
        <div className="animate-fade-in">
          <h3 className="text-sm font-semibold text-gold uppercase tracking-[0.2em] mb-3">
            {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            <span className="ml-2 text-[var(--text-muted)] normal-case tracking-normal">
              ({selectedBookings.length} booking{selectedBookings.length !== 1 ? "s" : ""})
            </span>
          </h3>

          {selectedBookings.length === 0 ? (
            <div className="glass-card p-8 text-center text-[var(--text-muted)]">
              No bookings on this day.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedBookings
                .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
                .map((b) => (
                <div key={b.id} className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-mono text-gold font-medium shrink-0">{b.time}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{b.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{getServiceName(b.service, "en")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        b.status === "approved" ? "bg-green-500/15 text-green-400" :
                        b.status === "rejected" ? "bg-red-500/15 text-red-400" :
                        "bg-yellow-500/15 text-yellow-400"
                      }`}>{b.status}</span>
                      {b.referenceNumber && (
                        <span className="font-mono text-xs text-[var(--text-muted)]">{b.referenceNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
