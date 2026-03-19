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
        if (res.status === 404) {
          setError("Booking not found. Please check your reference number.");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch booking");
        const data = await res.json();
        setBooking(data);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [ref]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-500 mt-4">Loading booking...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/booking/lookup" className="text-blue-600 hover:underline font-medium">
          Try another lookup
        </Link>
      </div>
    );
  }

  const statusMessage = {
    pending: "Your booking is being reviewed. You\u2019ll receive an email when it\u2019s confirmed.",
    approved: `Your booking is confirmed! See you on ${booking.date} at ${booking.time}.`,
    rejected: "Unfortunately this booking couldn\u2019t be accommodated. You can submit a new booking.",
  }[booking.status] || "";

  const statusBg = {
    pending: "bg-yellow-50 border-yellow-200 text-yellow-800",
    approved: "bg-green-50 border-green-200 text-green-800",
    rejected: "bg-red-50 border-red-200 text-red-800",
  }[booking.status] || "";

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Reference badge */}
      <div className="text-center mb-6">
        <span className="inline-block px-4 py-2 bg-gray-100 rounded-full font-mono text-sm font-medium text-gray-700 tracking-wide">
          {booking.referenceNumber}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
        Booking Status
      </h1>

      {/* Booking details card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Booking Details
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium text-gray-900">{booking.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Guests</p>
            <p className="font-medium text-gray-900">{booking.guests}</p>
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium text-gray-900">{booking.date}</p>
          </div>
          <div>
            <p className="text-gray-500">Time</p>
            <p className="font-medium text-gray-900">{booking.time}</p>
          </div>
        </div>
      </div>

      {/* Status timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Status
        </h2>
        <StatusTimeline
          status={booking.status}
          createdAt={booking.createdAt}
          statusUpdatedAt={booking.statusUpdatedAt}
        />
      </div>

      {/* Status message */}
      <div className={`rounded-lg border px-4 py-3 text-sm ${statusBg} mb-6`}>
        {statusMessage}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/"
          className="flex-1 text-center bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {booking.status === "rejected" ? "Book Again" : "New Booking"}
        </Link>
        <Link
          href="/booking/lookup"
          className="flex-1 text-center bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Track Another
        </Link>
      </div>
    </div>
  );
}
