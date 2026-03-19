"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "";
  const [copied, setCopied] = useState(false);

  async function copyRef() {
    if (!ref) return;
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  }

  return (
    <div className="max-w-md mx-auto text-center py-12 animate-fade-in">
      {/* Success icon */}
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Submitted!</h1>
      <p className="text-gray-600 mb-8">
        Thank you for your booking request. We&apos;ll review it and notify you by email.
      </p>

      {/* Reference number card */}
      {ref && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Your Reference Number
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl font-mono font-bold text-gray-900 tracking-widest">
              {ref}
            </span>
            <button
              onClick={copyRef}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors group"
              title="Copy reference number"
            >
              {copied ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Save this to track your booking status</p>
        </div>
      )}

      {/* What happens next */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 text-left">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          What Happens Next
        </h3>
        <div className="space-y-4">
          {[
            { step: "1", label: "Submitted", desc: "Your booking has been received", active: true },
            { step: "2", label: "Under Review", desc: "We'll review your request shortly", active: false },
            { step: "3", label: "Confirmation", desc: "You'll get an email with the decision", active: false },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                item.active
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {item.step}
              </div>
              <div>
                <p className={`text-sm font-medium ${item.active ? "text-gray-900" : "text-gray-500"}`}>
                  {item.label}
                </p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {ref && (
          <Link
            href={`/booking/lookup/${ref}`}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Track My Booking
          </Link>
        )}
        <Link
          href="/"
          className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Make Another Booking
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto text-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
