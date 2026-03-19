"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  guests?: string;
}

export default function BookingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "1",
    message: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.name || form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.phone || form.phone.trim().length < 6) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!form.date) {
      newErrors.date = "Please select a date";
    }
    if (!form.time) {
      newErrors.time = "Please select a time";
    }
    const guestsNum = Number(form.guests);
    if (!guestsNum || guestsNum < 1 || guestsNum > 20) {
      newErrors.guests = "Guests must be between 1 and 20";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || err.error || "Something went wrong");
      }

      const data = await res.json();
      router.push(`/booking-success?ref=${data.referenceNumber}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to submit booking");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-4 py-2.5 border rounded-lg outline-none transition-all ${
      errors[field]
        ? "border-red-400 focus:ring-2 focus:ring-red-300 focus:border-red-400"
        : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
          {serverError}
        </div>
      )}

      {/* Section 1: Your Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Your Details
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="John Doe"
              className={inputClass("name")}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="john@example.com"
                className={inputClass("email")}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+971 50 123 4567"
                className={inputClass("phone")}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Section 2: Booking Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Booking Details
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                min={today}
                className={inputClass("date")}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                id="time"
                value={form.time}
                onChange={(e) => updateField("time", e.target.value)}
                className={inputClass("time")}
              />
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>

            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                Guests *
              </label>
              <input
                type="number"
                id="guests"
                value={form.guests}
                onChange={(e) => updateField("guests", e.target.value)}
                min="1"
                max="20"
                className={inputClass("guests")}
              />
              {errors.guests && <p className="text-red-500 text-xs mt-1">{errors.guests}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="message"
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              rows={3}
              placeholder="Any special requests or notes..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {loading && (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? "Submitting..." : "Submit Booking"}
      </button>
    </form>
  );
}
