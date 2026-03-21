"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Booking } from "@/lib/types";
import StatsCards from "@/components/StatsCards";
import BookingDetailModal from "@/components/BookingDetailModal";

type SortOption = "newest" | "oldest" | "name";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", { headers: { "x-admin-password": password } });
      if (!res.ok) {
        if (res.status === 401) { setIsAuthenticated(false); throw new Error("Invalid password"); }
        throw new Error("Failed to fetch bookings");
      }
      setBookings(await res.json());
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  }, [password]);

  useEffect(() => { if (isAuthenticated) fetchBookings(); }, [isAuthenticated, fetchBookings]);

  function handleLogin(e: React.FormEvent) { e.preventDefault(); setIsAuthenticated(true); }

  async function deleteBooking(id: string) {
    if (!confirm("Delete this booking? This cannot be undone.")) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
      if (!res.ok) throw new Error("Failed to delete");
      setBookings((prev) => prev.filter((b) => b.id !== id));
      if (selectedBooking?.id === id) setSelectedBooking(null);
    } catch { setError("Failed to delete booking"); }
    finally { setUpdatingId(null); }
  }

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const statusUpdatedAt = new Date().toISOString();
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status, statusUpdatedAt } : b)));
      if (selectedBooking?.id === id) setSelectedBooking((prev) => prev ? { ...prev, status, statusUpdatedAt } : null);
    } catch { setError("Failed to update booking status"); }
    finally { setUpdatingId(null); }
  }

  const counts = useMemo(() => ({
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  }), [bookings]);

  const displayedBookings = useMemo(() => {
    let result = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((b) =>
        b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || (b.referenceNumber && b.referenceNumber.toLowerCase().includes(q))
      );
    }
    result = [...result].sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [bookings, filter, search, sort]);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-400",
    approved: "bg-green-500/15 text-green-400",
    rejected: "bg-red-500/15 text-red-400",
  };

  // --- Login ---
  if (!isAuthenticated) {
    return (
      <div className="max-w-sm mx-auto py-20 px-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-center text-white mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
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

  // --- Dashboard ---
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Booking Dashboard</h1>
        <div className="flex gap-2">
          <a href="/admin/analytics" className="text-sm px-4 py-2 rounded-xl border border-gold/30 text-gold hover:bg-gold/10 transition-colors">
            Analytics
          </a>
          <button onClick={fetchBookings} disabled={loading}
            className="text-sm px-4 py-2 rounded-xl border border-white/10 text-[var(--text-muted)] hover:bg-white/5 transition-colors disabled:opacity-50">
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">{error}</div>}

      <StatsCards counts={counts} />

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or reference..."
            className="w-full pl-10 pr-4 py-2 input-dark text-sm" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-3 py-2 input-dark text-sm">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab ? "bg-gold text-[#0f172a]" : "border border-white/10 text-[var(--text-muted)] hover:bg-white/5"
            }`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading && bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto" />
          <p className="text-[var(--text-muted)] mt-4">Loading bookings...</p>
        </div>
      ) : displayedBookings.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          {search ? `No results for "${search}"` : `No ${filter === "all" ? "" : filter} bookings found.`}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedBookings.map((booking) => (
            <div key={booking.id} onClick={() => setSelectedBooking(booking)}
              className="glass-card p-5 hover:bg-white/10 transition-all cursor-pointer animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-lg text-white">{booking.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status] || ""}`}>{booking.status}</span>
                    {booking.referenceNumber && <span className="font-mono text-xs text-[var(--text-muted)]">{booking.referenceNumber}</span>}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{booking.email} &middot; {booking.phone}{booking.nationality && <> &middot; {booking.nationality}</>}</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {booking.date} at {booking.time}
                    {booking.guests && booking.guests > 1 && <> &middot; {booking.guests} guests</>}
                  </p>
                  {booking.message && <p className="text-sm text-[var(--text-muted)] truncate">{booking.message}</p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-[var(--navy-mid)]">Submitted: {new Date(booking.createdAt).toLocaleString()}</p>
                    {booking.arrivalStatus && booking.arrivalStatus !== "none" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gold/15 text-gold">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                        {booking.arrivalStatus === "left-home" ? "Left Home" : booking.arrivalStatus === "on-the-way" ? "On The Way" : "Arrived"}
                      </span>
                    )}
                    {booking.locationLink && (
                      <a href={booking.locationLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-blue-400 hover:underline">
                        View Location
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {booking.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(booking.id, "approved")} disabled={updatingId === booking.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                        {updatingId === booking.id ? "..." : "Approve"}
                      </button>
                      <button onClick={() => updateStatus(booking.id, "rejected")} disabled={updatingId === booking.id}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                        {updatingId === booking.id ? "..." : "Reject"}
                      </button>
                    </>
                  )}
                  <button onClick={() => deleteBooking(booking.id)} disabled={updatingId === booking.id}
                    className="p-2 rounded-xl text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors" title="Delete">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onUpdateStatus={updateStatus} onDelete={deleteBooking} updatingId={updatingId} />
    </div>
  );
}
