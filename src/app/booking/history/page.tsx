"use client";

import { useState } from "react";
import Link from "next/link";
import { getServiceName } from "@/lib/services";

interface BookingItem {
  referenceNumber: string;
  name: string;
  date: string;
  time: string;
  service: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
};

export default function BookingHistoryPage() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");
    setSearched(false);

    try {
      const res = await fetch(`/api/bookings/lookup?email=${encodeURIComponent(email.trim())}`);
      if (!res.ok) throw new Error("Failed to look up bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-center text-white mb-2">My Bookings</h1>
      <p className="text-center text-[var(--text-muted)] mb-8">
        Enter your email to view all your bookings.
      </p>

      {/* Search form */}
      <form onSubmit={handleSearch} className="glass-card p-5 mb-8">
        <div className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
            className="flex-1 px-4 py-2.5 input-dark text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 btn-gold text-sm font-medium shrink-0 disabled:opacity-50"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && bookings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/5">
            <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-[var(--text-muted)]">No bookings found for this email.</p>
          <Link href="/" className="inline-block mt-4 text-gold hover:underline text-sm font-medium">
            Make a Booking
          </Link>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-muted)] mb-2">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
          </p>
          {bookings.map((b) => (
            <Link
              key={b.referenceNumber}
              href={`/booking/lookup/${b.referenceNumber}`}
              className="glass-card p-4 block hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium text-gold">{b.referenceNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status] || "bg-gray-500/15 text-gray-400"}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium">{getServiceName(b.service, "en")}</p>
                  <p className="text-xs text-[var(--text-muted)]">{b.date} at {b.time}</p>
                </div>
                <svg className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
