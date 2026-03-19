"use client";

import type { Booking } from "@/lib/types";
import StatusTimeline from "./StatusTimeline";

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: "approved" | "rejected") => void;
  onDelete: (id: string) => void;
  updatingId: string | null;
}

export default function BookingDetailModal({ booking, onClose, onUpdateStatus, onDelete, updatingId }: BookingDetailModalProps) {
  if (!booking) return null;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-400",
    approved: "bg-green-500/15 text-green-400",
    rejected: "bg-red-500/15 text-red-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative bg-[var(--navy-light)] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <span className="font-mono text-sm text-gold font-medium">{booking.referenceNumber || "N/A"}</span>
            <h2 className="text-lg font-bold text-white mt-1">{booking.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-muted)]">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || ""}`}>{booking.status}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-[var(--text-muted)]">Email</p><p className="font-medium text-white">{booking.email}</p></div>
            <div><p className="text-[var(--text-muted)]">Phone</p><p className="font-medium text-white">{booking.phone}</p></div>
            <div><p className="text-[var(--text-muted)]">Date</p><p className="font-medium text-white">{booking.date}</p></div>
            <div><p className="text-[var(--text-muted)]">Time</p><p className="font-medium text-white">{booking.time}</p></div>
            <div><p className="text-[var(--text-muted)]">Guests</p><p className="font-medium text-white">{booking.guests || 1}</p></div>
            <div><p className="text-[var(--text-muted)]">Submitted</p><p className="font-medium text-white">{new Date(booking.createdAt).toLocaleDateString()}</p></div>
          </div>

          {booking.message && (
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">Message</p>
              <p className="text-sm text-white bg-white/5 rounded-lg p-3">{booking.message}</p>
            </div>
          )}

          {/* Arrival status */}
          {booking.arrivalStatus && booking.arrivalStatus !== "none" && (
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-2">Arrival Status</p>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-gold/15 text-gold">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  {booking.arrivalStatus === "left-home" ? "Left Home" : booking.arrivalStatus === "on-the-way" ? "On The Way" : "Arrived"}
                </span>
                {booking.arrivalUpdatedAt && (
                  <span className="text-xs text-[var(--text-muted)]">{new Date(booking.arrivalUpdatedAt).toLocaleString()}</span>
                )}
              </div>
              {booking.locationLink && (
                <a href={booking.locationLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-blue-400 hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View Live Location
                </a>
              )}
            </div>
          )}

          <div>
            <p className="text-sm text-[var(--text-muted)] mb-3">Timeline</p>
            <StatusTimeline status={booking.status} createdAt={booking.createdAt} statusUpdatedAt={booking.statusUpdatedAt} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/5">
          {booking.status === "pending" && (
            <>
              <button onClick={() => onUpdateStatus(booking.id, "approved")} disabled={updatingId === booking.id}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                {updatingId === booking.id ? "Updating..." : "Approve"}
              </button>
              <button onClick={() => onUpdateStatus(booking.id, "rejected")} disabled={updatingId === booking.id}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                {updatingId === booking.id ? "Updating..." : "Reject"}
              </button>
            </>
          )}
          <button onClick={() => onDelete(booking.id)} disabled={updatingId === booking.id}
            className="px-4 py-2.5 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
