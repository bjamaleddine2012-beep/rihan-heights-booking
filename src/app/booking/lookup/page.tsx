"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusTimeline from "@/components/StatusTimeline";

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

      if (res.status === 404) {
        setError("No booking found with that reference number.");
        return;
      }
      if (!res.ok) throw new Error("Failed to look up booking");

      const data = await res.json();

      if (tab === "ref") {
        // Single booking — navigate to detail page
        router.push(`/booking/lookup/${data.referenceNumber}`);
      } else {
        // Array of bookings
        setResults(Array.isArray(data) ? data : [data]);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Booking</h1>
        <p className="text-gray-600">Look up your booking by reference number or email address.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-fade-in">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => { setTab("ref"); setError(""); setResults([]); setSearched(false); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === "ref" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Reference Number
          </button>
          <button
            onClick={() => { setTab("email"); setError(""); setResults([]); setSearched(false); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === "email" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Email Address
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          {tab === "ref" ? (
            <div>
              <label htmlFor="ref" className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                id="ref"
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                placeholder="RH-20260319-A1B2"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono tracking-wide"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="lookup-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="lookup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
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
        <div className="text-center py-8 text-gray-500">No bookings found for this email.</div>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {results.length} booking{results.length > 1 ? "s" : ""} found
          </h2>
          {results.map((booking) => (
            <button
              key={booking.referenceNumber}
              onClick={() => router.push(`/booking/lookup/${booking.referenceNumber}`)}
              className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all animate-fade-in"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium text-blue-600">
                      {booking.referenceNumber || "N/A"}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status] || "bg-gray-100 text-gray-800"}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {booking.date} at {booking.time} &middot; {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
