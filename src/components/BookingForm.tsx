"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || err.error || "Something went wrong");
      }

      router.push("/booking-success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit booking");
    } finally {
      setLoading(false);
    }
  }

  // Minimum date is today
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="John Doe"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="john@example.com"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Date *
        </label>
        <input
          type="date"
          id="date"
          name="date"
          required
          min={today}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
        />
      </div>

      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Time *
        </label>
        <input
          type="time"
          id="time"
          name="time"
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Tell us about your booking needs..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Submitting..." : "Submit Booking"}
      </button>
    </form>
  );
}
