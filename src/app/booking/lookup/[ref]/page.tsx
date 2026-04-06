"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import StatusTimeline from "@/components/StatusTimeline";
import { getDisplayStatus } from "@/lib/booking-utils";
import { getServiceName, getServiceById } from "@/lib/services";

interface BookingDetail {
  referenceNumber: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  service: string;
  status: string;
  arrivalStatus: string;
  arrivalUpdatedAt?: string | null;
  locationLink?: string | null;
  rescheduledFrom?: { date: string; time: string } | null;
  createdAt: string;
  statusUpdatedAt?: string | null;
}

export default function BookingDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingArrival, setUpdatingArrival] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/lookup?ref=${encodeURIComponent(ref)}`);
        if (res.status === 404) { setError("Booking not found."); return; }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setBooking(data);
      } catch { setError("Something went wrong."); }
      finally { setLoading(false); }
    }
    fetchBooking();
  }, [ref]);

  async function updateArrivalStatus(arrivalStatus: string) {
    if (!booking) return;
    setUpdatingArrival(true);
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceNumber: booking.referenceNumber, arrivalStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update");
      }
      setBooking((prev) => prev ? { ...prev, arrivalStatus, arrivalUpdatedAt: new Date().toISOString() } : null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update arrival status");
    } finally {
      setUpdatingArrival(false);
    }
  }

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

  const displayStatus = getDisplayStatus(booking.status, booking.date, booking.time);
  const serviceConfig = getServiceById(booking.service);
  const serviceName = getServiceName(booking.service, "en");

  const statusMessage: Record<string, string> = {
    pending: "Your booking is being reviewed. You\u2019ll receive an email when it\u2019s confirmed.",
    approved: `Your booking is confirmed! See you on ${booking.date} at ${booking.time}.`,
    rejected: "Unfortunately this booking couldn\u2019t be accommodated. You can submit a new booking.",
    ended: "This appointment has ended. Thank you for visiting!",
  };

  const statusBg: Record<string, string> = {
    pending: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    approved: "bg-green-500/10 border-green-500/20 text-green-400",
    rejected: "bg-red-500/10 border-red-500/20 text-red-400",
    ended: "bg-gray-500/10 border-gray-500/20 text-gray-400",
  };

  const currentArrival = booking.arrivalStatus || "none";

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

        {/* Service display */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
          {serviceConfig && (
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={serviceConfig.icon} />
              </svg>
            </div>
          )}
          <div>
            <p className="font-medium text-white">{serviceName}</p>
            {serviceConfig && (
              <p className="text-xs text-[var(--text-muted)]">{serviceConfig.estimatedDuration}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-[var(--text-muted)]">Name</p><p className="font-medium text-white">{booking.name}</p></div>
          <div><p className="text-[var(--text-muted)]">Guests</p><p className="font-medium text-white">{booking.guests}</p></div>
          <div>
            <p className="text-[var(--text-muted)]">Date</p>
            <p className="font-medium text-white">{booking.date}</p>
            {booking.rescheduledFrom && (
              <p className="text-xs text-yellow-400/80 mt-0.5">
                Rescheduled from {booking.rescheduledFrom.date} at {booking.rescheduledFrom.time}
              </p>
            )}
          </div>
          <div><p className="text-[var(--text-muted)]">Time</p><p className="font-medium text-white">{booking.time}</p></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">Status</h2>
        <StatusTimeline status={displayStatus} createdAt={booking.createdAt} statusUpdatedAt={booking.statusUpdatedAt} />
      </div>

      {/* Status message */}
      <div className={`rounded-xl border px-4 py-3 text-sm ${statusBg[displayStatus] || statusBg[booking.status] || ""} mb-6`}>
        {statusMessage[displayStatus] || statusMessage[booking.status]}
      </div>

      {/* QR Code + Calendar — only for approved bookings that haven't ended */}
      {booking.status === "approved" && displayStatus !== "ended" && (
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">Your Booking Pass</h2>
          <div className="flex justify-center mb-4">
            <img
              src={`/api/bookings/qr?ref=${encodeURIComponent(booking.referenceNumber)}`}
              alt="Booking QR Code"
              className="w-40 h-40 rounded-xl"
              width={160}
              height={160}
            />
          </div>
          <p className="text-xs text-center text-[var(--text-muted)] mb-4">Show this QR code at arrival for quick check-in</p>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`/api/bookings/qr?ref=${encodeURIComponent(booking.referenceNumber)}`}
              download={`qr-${booking.referenceNumber}.png`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[var(--text-muted)] hover:bg-white/5 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              QR Code
            </a>
            <a
              href={`/api/bookings/calendar?ref=${encodeURIComponent(booking.referenceNumber)}&name=${encodeURIComponent(booking.name)}&date=${booking.date}&time=${booking.time}`}
              download={`${booking.referenceNumber}.ics`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[var(--text-muted)] hover:bg-white/5 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </a>
          </div>
        </div>
      )}

      {/* Arrival Tracking — only for approved bookings that haven't ended */}
      {booking.status === "approved" && displayStatus !== "ended" && (
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">Arrival Tracking</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">Let us know when you&apos;re on your way!</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => updateArrivalStatus("on-the-way")}
              disabled={updatingArrival}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                currentArrival === "on-the-way"
                  ? "bg-gold/20 border border-gold/40 text-gold"
                  : "bg-white/5 border border-white/5 text-[var(--text-muted)] hover:bg-white/10"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              I&apos;m on my way
              {currentArrival === "on-the-way" && <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />}
            </button>
            <button
              onClick={() => updateArrivalStatus("arrived")}
              disabled={updatingArrival}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
                currentArrival === "arrived"
                  ? "bg-gold/20 border border-gold/40 text-gold"
                  : "bg-white/5 border border-white/5 text-[var(--text-muted)] hover:bg-white/10"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              I&apos;ve arrived
              {currentArrival === "arrived" && <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />}
            </button>
          </div>

          {booking.arrivalUpdatedAt && currentArrival !== "none" && (
            <p className="text-xs text-[var(--text-muted)]">
              Status: <span className="text-gold font-medium">{currentArrival === "on-the-way" ? "On the way" : "Arrived"}</span>
              {" \u2014 "}updated {new Date(booking.arrivalUpdatedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

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
