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
  arrivalStatus: string;
  arrivalUpdatedAt?: string | null;
  locationLink?: string | null;
  createdAt: string;
  statusUpdatedAt?: string | null;
}

const arrivalSteps = [
  { key: "left-home", label: "Left Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { key: "on-the-way", label: "On The Way", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { key: "arrived", label: "Arrived", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
];

export default function BookingDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingArrival, setUpdatingArrival] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);

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

  async function shareLocation() {
    if (!booking || !navigator.geolocation) {
      alert("Location sharing is not supported on this device.");
      return;
    }

    setSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        try {
          await fetch("/api/bookings/lookup", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ referenceNumber: booking.referenceNumber, locationLink }),
          });
          setBooking((prev) => prev ? { ...prev, locationLink } : null);
        } catch {
          alert("Failed to share location.");
        } finally {
          setSharingLocation(false);
        }
      },
      () => {
        alert("Location access denied. Please enable location in your browser settings.");
        setSharingLocation(false);
      },
      { enableHighAccuracy: true }
    );
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

      {/* Arrival Tracking — only for approved bookings */}
      {booking.status === "approved" && (
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">Arrival Tracking</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">Let us know when you&apos;re on your way!</p>

          {/* Arrival status buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {arrivalSteps.map((step) => {
              const isActive = currentArrival === step.key;
              const isPast = arrivalSteps.findIndex((s) => s.key === currentArrival) >= arrivalSteps.findIndex((s) => s.key === step.key) && currentArrival !== "none";

              return (
                <button
                  key={step.key}
                  onClick={() => updateArrivalStatus(step.key)}
                  disabled={updatingArrival}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-medium transition-all disabled:opacity-50 ${
                    isActive
                      ? "bg-gold/20 border border-gold/40 text-gold"
                      : isPast
                      ? "bg-gold/5 border border-gold/10 text-gold/60"
                      : "bg-white/5 border border-white/5 text-[var(--text-muted)] hover:bg-white/10"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                  </svg>
                  {step.label}
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {booking.arrivalUpdatedAt && currentArrival !== "none" && (
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Last updated: {new Date(booking.arrivalUpdatedAt).toLocaleString()}
            </p>
          )}

          {/* Share location button */}
          <button
            onClick={shareLocation}
            disabled={sharingLocation}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[var(--text-muted)] hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {sharingLocation ? "Getting location..." : booking.locationLink ? "Update My Location" : "Share My Live Location"}
          </button>

          {booking.locationLink && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400">Location shared</span>
              <a href={booking.locationLink} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline ml-auto">
                View on Maps
              </a>
            </div>
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
