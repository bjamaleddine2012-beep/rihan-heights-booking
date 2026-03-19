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
    } catch { /* fallback */ }
  }

  return (
    <div className="max-w-md mx-auto text-center py-16 px-4 animate-fade-in">
      {/* Gold success icon */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(212, 168, 83, 0.15)" }}>
        <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">Booking Submitted!</h1>
      <p className="text-[var(--text-muted)] mb-8">
        Thank you for your request. We&apos;ll review it and notify you by email.
      </p>

      {/* Reference number */}
      {ref && (
        <div className="glass-card p-5 mb-8">
          <p className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-2">
            Your Reference Number
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl font-mono font-bold text-white tracking-widest">{ref}</span>
            <button onClick={copyRef} className="p-2 rounded-lg hover:bg-white/5 transition-colors" title="Copy">
              {copied ? (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">Save this to track your booking</p>
        </div>
      )}

      {/* What happens next */}
      <div className="glass-card p-5 mb-8 text-left">
        <h3 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">What Happens Next</h3>
        <div className="space-y-4">
          {[
            { step: "1", label: "Submitted", desc: "Your booking has been received", active: true },
            { step: "2", label: "Under Review", desc: "We'll review your request shortly", active: false },
            { step: "3", label: "Confirmation", desc: "You'll get an email with the decision", active: false },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                item.active ? "bg-gold text-[#0f172a]" : "bg-white/5 text-[var(--text-muted)]"
              }`}>
                {item.step}
              </div>
              <div>
                <p className={`text-sm font-medium ${item.active ? "text-white" : "text-[var(--text-muted)]"}`}>{item.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {ref && (
          <Link href={`/booking/lookup/${ref}`} className="flex-1 py-2.5 btn-gold text-center text-sm">
            Track My Booking
          </Link>
        )}
        <Link href="/" className="flex-1 py-2.5 rounded-xl text-center text-sm font-medium border border-white/10 text-[var(--text-muted)] hover:bg-white/5 transition-colors">
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
        <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
