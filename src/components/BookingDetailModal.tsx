"use client";

import type { Booking } from "@/lib/types";
import StatusTimeline from "./StatusTimeline";

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: "approved" | "rejected") => void;
  updatingId: string | null;
}

export default function BookingDetailModal({
  booking,
  onClose,
  onUpdateStatus,
  updatingId,
}: BookingDetailModalProps) {
  if (!booking) return null;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <span className="font-mono text-sm text-blue-600 font-medium">
              {booking.referenceNumber || "N/A"}
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-1">{booking.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || ""}`}>
              {booking.status}
            </span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{booking.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{booking.phone}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium text-gray-900">{booking.date}</p>
            </div>
            <div>
              <p className="text-gray-500">Time</p>
              <p className="font-medium text-gray-900">{booking.time}</p>
            </div>
            <div>
              <p className="text-gray-500">Guests</p>
              <p className="font-medium text-gray-900">{booking.guests || 1}</p>
            </div>
            <div>
              <p className="text-gray-500">Submitted</p>
              <p className="font-medium text-gray-900">
                {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Message */}
          {booking.message && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Message</p>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                {booking.message}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Timeline</p>
            <StatusTimeline
              status={booking.status}
              createdAt={booking.createdAt}
              statusUpdatedAt={booking.statusUpdatedAt}
            />
          </div>
        </div>

        {/* Footer with actions */}
        {booking.status === "pending" && (
          <div className="flex gap-3 p-6 border-t border-gray-100">
            <button
              onClick={() => onUpdateStatus(booking.id, "approved")}
              disabled={updatingId === booking.id}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {updatingId === booking.id ? "Updating..." : "Approve"}
            </button>
            <button
              onClick={() => onUpdateStatus(booking.id, "rejected")}
              disabled={updatingId === booking.id}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {updatingId === booking.id ? "Updating..." : "Reject"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
