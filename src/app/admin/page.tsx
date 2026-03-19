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
      const res = await fetch("/api/bookings", {
        headers: { "x-admin-password": password },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          throw new Error("Invalid password");
        }
        throw new Error("Failed to fetch bookings");
      }

      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated, fetchBookings]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsAuthenticated(true);
  }

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const statusUpdatedAt = new Date().toISOString();
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status, statusUpdatedAt } : b))
      );

      // Update the modal booking too
      if (selectedBooking?.id === id) {
        setSelectedBooking((prev) => prev ? { ...prev, status, statusUpdatedAt } : null);
      }
    } catch {
      setError("Failed to update booking status");
    } finally {
      setUpdatingId(null);
    }
  }

  const counts = useMemo(() => ({
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  }), [bookings]);

  const displayedBookings = useMemo(() => {
    let result = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          (b.referenceNumber && b.referenceNumber.toLowerCase().includes(q))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [bookings, filter, search, sort]);

  // --- Login screen ---
  if (!isAuthenticated) {
    return (
      <div className="max-w-sm mx-auto py-16 animate-fade-in">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter admin password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  // --- Dashboard ---
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Booking Dashboard</h1>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="text-sm bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* Stats cards */}
      <StatsCards counts={counts} />

      {/* Search + Sort + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or reference..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading && bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-4">Loading bookings...</p>
        </div>
      ) : displayedBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {search ? `No results for "${search}"` : `No ${filter === "all" ? "" : filter} bookings found.`}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedBookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => setSelectedBooking(booking)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer animate-fade-in"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-lg">{booking.name}</h3>
                    <StatusBadge status={booking.status} />
                    {booking.referenceNumber && (
                      <span className="font-mono text-xs text-gray-400">
                        {booking.referenceNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{booking.email} &middot; {booking.phone}</p>
                  <p className="text-sm text-gray-600">
                    {booking.date} at {booking.time}
                    {booking.guests && booking.guests > 1 && (
                      <> &middot; {booking.guests} guests</>
                    )}
                  </p>
                  {booking.message && (
                    <p className="text-sm text-gray-500 truncate">{booking.message}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Submitted: {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>

                {booking.status === "pending" && (
                  <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => updateStatus(booking.id, "approved")}
                      disabled={updatingId === booking.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {updatingId === booking.id ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, "rejected")}
                      disabled={updatingId === booking.id}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {updatingId === booking.id ? "..." : "Reject"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdateStatus={updateStatus}
        updatingId={updatingId}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}
