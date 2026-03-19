"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import StatusTimeline from "@/components/StatusTimeline";

interface BookingDetail {
  referenceNumber: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  createdAt: string;
  statusUpdatedAt?: string | null;
}

export default function BookingDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/lookup?ref=${encodeURIComponent(ref)}`);
        if (res.status === 404) { setError("Booking not found."); return; }
        if (!res.ok) throw new Error("Failed to fetch");
        setBooking(await res.json());
      } catch { setError("Something went wrong."); }
      finally { setLoading(false); }
    }
    fetchBooking();
  }, [ref]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto" />
        <p className="text-[var(--text-muted)] mt-4">Loading booking...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 px-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239, 68, 68, 0.15)" }}>
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Booking Not Found</h1>
        <p className="text-[var(--text-muted)] mb-6">{error}</p>
        <Link href="/booking/lookup" className="text-gold hover:underline font-medium">Try another lookup</Link>
      </div>
    );
  }

  const statusMessage: Record<string, string> = {
    pending: "Your booking is being reviewed. You\u2019ll receive an email when it\u2019s confirmed.",
    approved: `Your booking is confirmed! See you on ${booking.date} at ${booking.time}.`,
    rejected: "Unfortunately this booking couldn\u2019t be accommodated. You can submit a new booking.",
  };

  const statusBg: Record<string, string> = {
    pending: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    approved: "bg-green-500/10 border-green-500/20 text-green-400",
    rejected: "bg-red-500/10 border-red-500/20 text-red-400",
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 animate-fade-in">
      {/* Reference badge */}
      <div className="text-center mb-6">
        <span className="inline-block px-4 py-2 bg-white/5 rounded-full font-mono text-sm font-medium text-gold tracking-wide">
          {booking.referenceNumber}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-center text-white mb-8">Booking Status</h1>

      {/* Details card */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">Booking Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-[var(--text-muted)]">Name</p><p className="font-medium text-white">{booking.name}</p></div>
          <div><p className="text-[var(--text-muted)]">Guests</p><p className="font-medium text-white">{booking.guests}</p></div>
          <div><p className="text-[var(--text-muted)]">Date</p><p className="font-medium text-white">{booking.date}</p></div>
          <div><p className="text-[var(--text-muted)]">Time</p><p className="font-medium text-white">{booking.time}</p></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">Status</h2>
        <StatusTimeline status={booking.status} createdAt={booking.createdAt} statusUpdatedAt={booking.statusUpdatedAt} />
      </div>

      {/* Status message */}
      <div className={`rounded-xl border px-4 py-3 text-sm ${statusBg[booking.status] || ""} mb-6`}>
        {statusMessage[booking.status]}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/" className="flex-1 text-center py-2.5 btn-gold text-sm">
          {booking.status === "rejected" ? "Book Again" : "New Booking"}
        </Link>
        <Link href="/booking/lookup" className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[var(--text-muted)] hover:bg-white/5 transition-colors">
          Track Another
        </Link>
      </div>
    </div>
  );
}
