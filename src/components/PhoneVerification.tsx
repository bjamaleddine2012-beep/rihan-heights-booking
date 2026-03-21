"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

interface PhoneVerificationProps {
  phone: string;
  onVerified: () => void;
  verified: boolean;
}

export default function PhoneVerification({ phone, onVerified, verified }: PhoneVerificationProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<"idle" | "sent" | "verified">(verified ? "verified" : "idle");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendCode() {
    if (!phone || phone.replace(/\D/g, "").length < 7) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");

      // In dev mode, auto-fill the code
      if (data.devCode) setCode(data.devCode);

      setStep("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");

      setStep("verified");
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  if (step === "verified" || verified) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-sm">
        <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-green-400 font-medium">{t("otp_verified")}</span>
      </div>
    );
  }

  if (step === "idle") {
    return (
      <div className="space-y-2">
        <p className="text-xs text-[var(--text-muted)]">{t("otp_desc")}</p>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="button"
          onClick={sendCode}
          disabled={loading || !phone || phone.replace(/\D/g, "").length < 7}
          className="w-full py-2 rounded-xl text-sm font-medium border border-white/10 text-[var(--text-muted)] hover:bg-white/5 hover:text-white transition-all disabled:opacity-30"
        >
          {loading ? t("otp_sending") : t("otp_send")}
        </button>
      </div>
    );
  }

  // step === "sent"
  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-muted)]">{t("otp_enterCode")} {phone}</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          className="flex-1 px-4 py-2 input-dark text-center font-mono text-lg tracking-[0.5em]"
        />
        <button
          type="button"
          onClick={verifyCode}
          disabled={loading || code.length !== 6}
          className="px-4 py-2 btn-gold text-sm disabled:opacity-30"
        >
          {loading ? "..." : t("otp_verify")}
        </button>
      </div>
      <button
        type="button"
        onClick={sendCode}
        disabled={loading}
        className="text-xs text-gold hover:underline disabled:opacity-50"
      >
        {t("otp_resend")}
      </button>
    </div>
  );
}
