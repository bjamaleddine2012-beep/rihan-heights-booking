"use client";

import { useState, useEffect } from "react";
import type { Booking } from "@/lib/types";
import { getDisplayStatus } from "@/lib/booking-utils";
import { getServiceName, getServiceById } from "@/lib/services";
import StatusTimeline from "./StatusTimeline";

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: "approved" | "rejected") => void;
  onDelete: (id: string) => void;
  onBookingUpdated?: (id: string, updates: Partial<Booking>) => void;
  updatingId: string | null;
  adminPassword: string;
}

export default function BookingDetailModal({
  booking,
  onClose,
  onUpdateStatus,
  onDelete,
  onBookingUpdated,
  updatingId,
  adminPassword,
}: BookingDetailModalProps) {
  // Admin notes state
  const [notes, setNotes] = useState(booking?.adminNotes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  // Reschedule state
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  // Reset notes when booking changes
  useEffect(() => {
    setNotes(booking?.adminNotes || "");
    setNotesSaved(false);
    setShowReschedule(false);
    setNewDate("");
    setNewTime("");
  }, [booking?.id]);

  if (!booking) return null;

  const displayStatus = getDisplayStatus(booking.status, booking.date, booking.time);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-400",
    approved: "bg-green-500/15 text-green-400",
    rejected: "bg-red-500/15 text-red-400",
    ended: "bg-gray-500/15 text-gray-400",
  };

  const service = booking.service ? getServiceById(booking.service) : null;
  const serviceName = booking.service ? getServiceName(booking.service, "en") : null;

  const notesChanged = notes !== (booking.adminNotes || "");

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ adminNotes: notes }),
      });
      if (res.ok) {
        setNotesSaved(true);
        if (onBookingUpdated) {
          onBookingUpdated(booking.id, { adminNotes: notes });
        }
        setTimeout(() => setNotesSaved(false), 2000);
      }
    } catch {
      // Silent fail
    } finally {
      setSavingNotes(false);
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;
    setRescheduling(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ date: newDate, time: newTime }),
      });
      if (res.ok) {
        const data = await res.json();
        if (onBookingUpdated) {
          onBookingUpdated(booking.id, data);
        }
        setShowReschedule(false);
        setNewDate("");
        setNewTime("");
      }
    } catch {
      // Silent fail
    } finally {
      setRescheduling(false);
    }
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
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[displayStatus] || ""}`}>{displayStatus}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-[var(--text-muted)]">Email</p><p className="font-medium text-white">{booking.email}</p></div>
            <div><p className="text-[var(--text-muted)]">Phone</p><p className="font-medium text-white">{booking.phone}</p></div>
            <div><p className="text-[var(--text-muted)]">Date</p><p className="font-medium text-white">{booking.date}</p></div>
            <div><p className="text-[var(--text-muted)]">Time</p><p className="font-medium text-white">{booking.time}</p></div>
            <div><p className="text-[var(--text-muted)]">Guests</p><p className="font-medium text-white">{booking.guests || 1}</p></div>
            <div><p className="text-[var(--text-muted)]">Nationality</p><p className="font-medium text-white">{booking.nationality || "—"}</p></div>
            {serviceName && (
              <div className="col-span-2">
                <p className="text-[var(--text-muted)]">Service</p>
                <p className="font-medium text-white flex items-center gap-2">
                  {service && (
                    <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                    </svg>
                  )}
                  {serviceName}
                </p>
              </div>
            )}
          </div>

          {/* Rescheduled From info */}
          {booking.rescheduledFrom && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-yellow-400">
                Rescheduled from {booking.rescheduledFrom.date} at {booking.rescheduledFrom.time}
              </span>
            </div>
          )}

          {booking.message && (
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">Message</p>
              <p className="text-sm text-white bg-white/5 rounded-lg p-3">{booking.message}</p>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-2">Admin Notes</p>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setNotesSaved(false);
              }}
              placeholder="Add private notes..."
              rows={3}
              className="input-dark w-full resize-none text-sm"
            />
            <div className="flex items-center gap-2 mt-2">
              {notesChanged && (
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="btn-gold px-4 py-1.5 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              )}
              {notesSaved && (
                <span className="text-xs text-green-400 font-medium">Saved!</span>
              )}
            </div>
          </div>

          {/* Arrival status */}
          {booking.arrivalStatus && booking.arrivalStatus !== "none" && (
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-2">Arrival Status</p>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-gold/15 text-gold">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  {booking.arrivalStatus === "on-the-way" ? "On The Way" : "Arrived"}
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
                  View Last Known Location
                </a>
              )}
            </div>
          )}

          <div>
            <p className="text-sm text-[var(--text-muted)] mb-3">Timeline</p>
            <StatusTimeline status={displayStatus} createdAt={booking.createdAt} statusUpdatedAt={booking.statusUpdatedAt} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 p-6 border-t border-white/5">
          <div className="flex gap-3">
            {booking.status === "pending" && displayStatus !== "ended" && (
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
            {booking.status === "approved" && displayStatus !== "ended" && (
              <button
                onClick={() => setShowReschedule(!showReschedule)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
              >
                {showReschedule ? "Cancel Reschedule" : "Reschedule"}
              </button>
            )}
            <button onClick={() => onDelete(booking.id)} disabled={updatingId === booking.id}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors">
              Delete
            </button>
          </div>

          {/* Reschedule Form */}
          {showReschedule && (
            <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
              <p className="text-sm text-[var(--text-muted)]">Reschedule Booking</p>
              <div className="flex gap-3">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="input-dark flex-1 text-sm"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="input-dark flex-1 text-sm"
                />
              </div>
              <button
                onClick={handleReschedule}
                disabled={rescheduling || !newDate || !newTime}
                className="btn-gold w-full py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {rescheduling ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
