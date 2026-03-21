"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Analytics {
  total: number;
  statusCounts: { pending: number; approved: number; rejected: number };
  approvalRate: number;
  averageGuests: number;
  topNationalities: { name: string; count: number }[];
  dailyData: { date: string; total: number; approved: number; rejected: number; pending: number }[];
  busiestHours: { hour: number; count: number }[];
  guestDistribution: { guests: number; count: number }[];
}

export default function AnalyticsPage() {
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Try to get password from session
    const saved = sessionStorage.getItem("admin_password");
    if (saved) { setPassword(saved); setIsAuth(true); }
  }, []);

  useEffect(() => {
    if (!isAuth) return;
    setLoading(true);
    fetch("/api/analytics", { headers: { "x-admin-password": password } })
      .then((res) => {
        if (res.status === 401) { setIsAuth(false); throw new Error("Invalid password"); }
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuth, password]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("admin_password", password);
    setIsAuth(true);
  }

  if (!isAuth) {
    return (
      <div className="max-w-sm mx-auto py-20 px-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-center text-white mb-6">Analytics Login</h1>
        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter admin password"
            className="w-full px-4 py-2.5 input-dark" />
          <button type="submit" className="w-full py-2.5 btn-gold">Login</button>
        </form>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto" />
        <p className="text-[var(--text-muted)] mt-4">Loading analytics...</p>
      </div>
    );
  }

  const maxDaily = Math.max(...data.dailyData.map((d) => d.total), 1);
  const maxHour = Math.max(...data.busiestHours.map((h) => h.count), 1);
  const maxNat = data.topNationalities[0]?.count || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <Link href="/admin" className="text-sm text-gold hover:underline">Back to Bookings</Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard label="Total Bookings" value={data.total} color="blue" />
        <KPICard label="Approval Rate" value={`${data.approvalRate}%`} color="green" />
        <KPICard label="Avg Guests" value={data.averageGuests} color="gold" />
        <KPICard label="Pending" value={data.statusCounts.pending} color="yellow" />
      </div>

      {/* Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-gold uppercase tracking-[0.15em] mb-4">Status Breakdown</h2>
          <div className="flex items-center justify-center gap-8">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  const total = data.total || 1;
                  const segments = [
                    { pct: data.statusCounts.approved / total, color: "#22c55e" },
                    { pct: data.statusCounts.pending / total, color: "#eab308" },
                    { pct: data.statusCounts.rejected / total, color: "#ef4444" },
                  ];
                  let offset = 0;
                  return segments.map((seg, i) => {
                    const dashLen = seg.pct * 100;
                    const el = (
                      <circle key={i} cx="18" cy="18" r="15.91549431" fill="none" stroke={seg.color}
                        strokeWidth="3" strokeDasharray={`${dashLen} ${100 - dashLen}`}
                        strokeDashoffset={-offset} opacity="0.8" />
                    );
                    offset += dashLen;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{data.total}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-[var(--text-muted)]">Approved: {data.statusCounts.approved}</span>
              </div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-[var(--text-muted)]">Pending: {data.statusCounts.pending}</span>
              </div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-[var(--text-muted)]">Rejected: {data.statusCounts.rejected}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Nationalities */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-gold uppercase tracking-[0.15em] mb-4">Top Nationalities</h2>
          {data.topNationalities.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">No data yet</p>
          ) : (
            <div className="space-y-2.5">
              {data.topNationalities.map((n) => (
                <div key={n.name} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--text-muted)] w-24 truncate">{n.name}</span>
                  <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gold/40 rounded-full transition-all" style={{ width: `${(n.count / maxNat) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-white w-8 text-right">{n.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily Bookings Chart */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-sm font-semibold text-gold uppercase tracking-[0.15em] mb-4">Daily Bookings (Last 30 Days)</h2>
        {data.dailyData.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm">No data yet</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {data.dailyData.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div
                  className="w-full bg-gold/40 rounded-t transition-all hover:bg-gold/60 min-h-[4px]"
                  style={{ height: `${(d.total / maxDaily) * 100}%` }}
                />
                <div className="absolute -top-8 hidden group-hover:block bg-[var(--navy)] border border-white/10 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap z-10">
                  {d.date}: {d.total} bookings
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Busiest Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-gold uppercase tracking-[0.15em] mb-4">Busiest Hours</h2>
          {data.busiestHours.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">No data yet</p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {Array.from({ length: 24 }, (_, h) => {
                const entry = data.busiestHours.find((e) => e.hour === h);
                const count = entry?.count || 0;
                return (
                  <div key={h} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div
                      className="w-full bg-blue-500/40 rounded-t transition-all hover:bg-blue-500/60 min-h-[2px]"
                      style={{ height: `${maxHour > 0 ? (count / maxHour) * 100 : 0}%` }}
                    />
                    {h % 4 === 0 && (
                      <span className="text-[10px] text-[var(--text-muted)] mt-1">{h}:00</span>
                    )}
                    {count > 0 && (
                      <div className="absolute -top-6 hidden group-hover:block bg-[var(--navy)] border border-white/10 rounded px-1.5 py-0.5 text-xs text-white z-10">
                        {h}:00 — {count}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-gold uppercase tracking-[0.15em] mb-4">Guest Distribution</h2>
          {data.guestDistribution.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {data.guestDistribution.map((g) => (
                <div key={g.guests} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--text-muted)] w-16">{g.guests} guest{g.guests !== 1 ? "s" : ""}</span>
                  <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/40 rounded-full" style={{ width: `${(g.count / data.total) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-white w-8 text-right">{g.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-green-500/10 text-green-400",
    gold: "bg-gold/10 text-gold",
    yellow: "bg-yellow-500/10 text-yellow-400",
  };
  return (
    <div className={`rounded-xl p-5 border border-white/5 ${colors[color] || ""}`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}
