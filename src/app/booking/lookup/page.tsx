"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BookingResult {
  referenceNumber: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  createdAt: string;
  statusUpdatedAt?: string | null;
}

export default function LookupPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"ref" | "email">("ref");
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<BookingResult[]>([]);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    setSearched(true);

    try {
      const query = tab === "ref" ? `ref=${encodeURIComponent(ref)}` : `email=${encodeURIComponent(email)}`;
      const res = await fetch(`/api/bookings/lookup?${query}`);
      if (res.status === 404) { setError("No booking found with that reference."); return; }
      if (!res.ok) throw new Error("Failed to look up booking");
      const data = await res.json();
      if (tab === "ref") { router.push(`/booking/lookup/${data.referenceNumber}`); }
      else { setResults(Array.isArray(data) ? data : [data]); }
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-400",
    approved: "bg-green-500/15 text-green-400",
    rejected: "bg-red-500/15 text-red-400",
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Track Your Booking</h1>
        <p className="text-[var(--text-muted)]">Look up by reference number or email address.</p>
      </div>

      <div className="glass-card p-6 sm:p-8 animate-fade-in">
        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setTab("ref"); setError(""); setResults([]); setSearched(false); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === "ref" ? "bg-white/10 text-white shadow-sm" : "text-[var(--text-muted)] hover:text-white"
            }`}
          >Reference Number</button>
          <button
            onClick={() => { setTab("email"); setError(""); setResults([]); setSearched(false); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === "email" ? "bg-white/10 text-white shadow-sm" : "text-[var(--text-muted)] hover:text-white"
            }`}
          >Email Address</button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          {tab === "ref" ? (
            <div>
              <label htmlFor="ref" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Reference Number</label>
              <input type="text" id="ref" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="RH-20260319-A1B2" required className="w-full px-4 py-2.5 input-dark font-mono tracking-wide" />
            </div>
          ) : (
            <div>
              <label htmlFor="lookup-email" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Email Address</label>
              <input type="email" id="lookup-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required className="w-full px-4 py-2.5 input-dark" />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading} className="w-full py-2.5 btn-gold flex items-center justify-center gap-2">
            {loading && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Searching..." : "Look Up Booking"}
          </button>
        </form>
      </div>

      {/* Email results */}
      {tab === "email" && searched && !loading && results.length === 0 && !error && (
        <div className="text-center py-8 text-[var(--text-muted)]">No bookings found for this email.</div>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">{results.length} booking{results.length > 1 ? "s" : ""} found</h2>
          {results.map((booking) => (
            <button
              key={booking.referenceNumber}
              onClick={() => router.push(`/booking/lookup/${booking.referenceNumber}`)}
              className="w-full text-left glass-card p-5 hover:bg-white/10 transition-all animate-fade-in"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium text-gold">{booking.referenceNumber || "N/A"}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status] || ""}`}>{booking.status}</span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{booking.date} at {booking.time} &middot; {booking.guests} guest{booking.guests !== 1 ? "s" : ""}</p>
                </div>
                <svg className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
