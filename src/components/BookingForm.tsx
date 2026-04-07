"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { SERVICES, getServiceName, getServiceById } from "@/lib/services";

// ---------------------------------------------------------------------------
// Nationalities list
// ---------------------------------------------------------------------------
const NATIONALITIES = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentine",
  "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahraini", "Bangladeshi",
  "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese",
  "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian",
  "Burkinabe", "Burmese", "Burundian", "Cambodian", "Cameroonian", "Canadian",
  "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian",
  "Comorian", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech",
  "Danish", "Djiboutian", "Dominican", "Dutch", "Ecuadorian", "Egyptian", "Emirati",
  "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian", "Fijian", "Filipino",
  "Finnish", "French", "Gabonese", "Gambian", "Georgian", "German", "Ghanaian",
  "Greek", "Grenadian", "Guatemalan", "Guinean", "Guyanese", "Haitian", "Honduran",
  "Hungarian", "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish",
  "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakh",
  "Kenyan", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian",
  "Libyan", "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malawian",
  "Malaysian", "Maldivian", "Malian", "Maltese", "Mauritanian", "Mauritian",
  "Mexican", "Moldovan", "Monegasque", "Mongolian", "Montenegrin", "Moroccan",
  "Mozambican", "Namibian", "Nepalese", "New Zealander", "Nicaraguan", "Nigerian",
  "North Korean", "Norwegian", "Omani", "Pakistani", "Palestinian", "Panamanian",
  "Papua New Guinean", "Paraguayan", "Peruvian", "Polish", "Portuguese", "Qatari",
  "Romanian", "Russian", "Rwandan", "Saudi", "Senegalese", "Serbian", "Singaporean",
  "Slovak", "Slovenian", "Somali", "South African", "South Korean", "Spanish",
  "Sri Lankan", "Sudanese", "Surinamese", "Swedish", "Swiss", "Syrian", "Taiwanese",
  "Tajik", "Tanzanian", "Thai", "Togolese", "Trinidadian", "Tunisian", "Turkish",
  "Turkmen", "Ugandan", "Ukrainian", "Uruguayan", "Uzbek", "Venezuelan",
  "Vietnamese", "Yemeni", "Zambian", "Zimbabwean",
];

// ---------------------------------------------------------------------------
// Helper: convert 24-hour time to 12-hour display
// ---------------------------------------------------------------------------
function formatTime(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Generate every 30-minute slot from 09:00 to 21:00
// ---------------------------------------------------------------------------
const TIME_SLOTS: string[] = [];
for (let h = 9; h <= 21; h++) {
  TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:00`);
  if (h < 21) {
    TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:30`);
  }
}

// ---------------------------------------------------------------------------
// Step labels
// ---------------------------------------------------------------------------
const STEP_LABELS = ["Service", "Date & Time", "Details", "Review"];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function BookingForm() {
  const router = useRouter();
  const { t, locale } = useLanguage();

  // ---- Wizard state ----
  const [step, setStep] = useState(1);
  const [service, setService] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    date: "",
    time: "",
    guests: "1",
    message: "",
  });
  const [duration, setDuration] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // ---- Helpers ----
  const today = new Date().toISOString().split("T")[0];

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 input-dark ${errors[field] ? "input-error" : ""}`;

  // ---- Fetch availability when date changes ----
  async function handleDateChange(date: string) {
    updateField("date", date);
    // Reset selected time when date changes
    updateField("time", "");

    if (!date) {
      setBookedSlots([]);
      return;
    }

    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/bookings/availability?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setBookedSlots(data.bookedSlots || []);
      } else {
        setBookedSlots([]);
      }
    } catch {
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  // ---- Per-step validation ----
  function validateStep(currentStep: number): boolean {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!service) {
        newErrors.service = t("val_serviceRequired") || "Please select a service";
      }
    }

    if (currentStep === 2) {
      if (!form.date) newErrors.date = t("val_dateRequired") || "Date is required";
      if (!form.time) newErrors.time = t("val_timeRequired") || "Time is required";
      const selectedService = getServiceById(service);
      if (selectedService?.allowDurationPick && !duration) {
        newErrors.duration = "Please select a duration";
      }
    }

    if (currentStep === 3) {
      if (!form.name || form.name.trim().length < 2) {
        newErrors.name = t("val_nameMin") || "Name must be at least 2 characters";
      }

      if (!form.email) {
        newErrors.email = t("val_emailRequired") || "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
        newErrors.email = t("val_emailInvalid") || "Invalid email address";
      } else if (/\.(con|cmo|coom|gmial|gamil|yahooo)$/i.test(form.email)) {
        newErrors.email = t("val_emailTypo") || "Possible typo in email domain";
      }

      if (!form.phone) {
        newErrors.phone = t("val_phoneRequired") || "Phone is required";
      } else {
        const digitsOnly = form.phone.replace(/[\s\-\(\)\+]/g, "");
        if (!/^\d+$/.test(digitsOnly)) {
          newErrors.phone = t("val_phoneDigits") || "Phone must contain only digits";
        } else if (digitsOnly.length < 7) {
          newErrors.phone = t("val_phoneMin") || "Phone must be at least 7 digits";
        } else if (digitsOnly.length > 15) {
          newErrors.phone = t("val_phoneLong") || "Phone is too long";
        }
      }

      if (!form.nationality) {
        newErrors.nationality = t("val_nationalityRequired") || "Nationality is required";
      }

      const guestsNum = Number(form.guests);
      if (!guestsNum || guestsNum < 1 || guestsNum > 20) {
        newErrors.guests = t("val_guestsRange") || "Guests must be between 1 and 20";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ---- Navigation ----
  function handleNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 4));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  // ---- Submit ----
  async function handleSubmit() {
    if (!validateStep(3)) {
      setStep(3);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, service, ...(duration ? { duration } : {}) }),
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

  // ---- Find the selected service object ----
  const selectedService = SERVICES.find((s) => s.id === service);

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="space-y-8">
      {/* ------ Progress Bar ------ */}
      <div className="flex items-center justify-between px-2">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;

          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isCompleted
                      ? "bg-[var(--gold)] text-[#0f172a]"
                      : isActive
                      ? "bg-[var(--gold)] text-[#0f172a]"
                      : "bg-white/10 text-[var(--text-muted)]"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                    isActive || isCompleted ? "text-[var(--gold)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connecting line (not after last step) */}
              {stepNum < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mt-[-18px] transition-all ${
                    step > stepNum ? "bg-[var(--gold)]" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ------ Server error ------ */}
      {serverError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-fade-in">
          {serverError}
        </div>
      )}

      {/* ================================================================== */}
      {/* STEP 1: Choose Service                                             */}
      {/* ================================================================== */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h3 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">
            {t("form_chooseService") || "Choose a Service"}
          </h3>

          {errors.service && (
            <p className="text-red-400 text-xs mb-3">{errors.service}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((svc) => {
              const isSelected = service === svc.id;
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => {
                    setService(svc.id);
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.service;
                      return next;
                    });
                  }}
                  className={`p-5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "border-2 border-[var(--gold)] bg-[var(--gold)]/10"
                      : "border border-white/10 hover:border-[var(--gold)]/50"
                  }`}
                >
                  {/* Icon */}
                  <div className={`mb-3 ${isSelected ? "text-[var(--gold)]" : "text-[var(--text-muted)]"}`}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={svc.icon} />
                    </svg>
                  </div>

                  {/* Name */}
                  <h4 className="font-semibold text-sm mb-1">
                    {locale === "ar" ? svc.nameAr : svc.nameEn}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    {locale === "ar" ? svc.descriptionAr : svc.descriptionEn}
                  </p>

                  {/* Duration badge */}
                  <span className="inline-block text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/5 text-[var(--text-muted)]">
                    {svc.estimatedDuration}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* STEP 2: Pick Date & Time                                           */}
      {/* ================================================================== */}
      {step === 2 && (
        <div className="animate-fade-in space-y-6">
          <h3 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">
            {t("form_pickDateTime") || "Pick a Date & Time"}
          </h3>

          {/* Date input */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
              {t("form_date") || "Date"} *
            </label>
            <input
              type="date"
              id="date"
              value={form.date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={today}
              className={inputClass("date")}
            />
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Time slots */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              {t("form_time") || "Time"} *
            </label>

            {errors.time && <p className="text-red-400 text-xs mb-2">{errors.time}</p>}

            {loadingSlots ? (
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] py-4">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t("form_loadingSlots") || "Loading available slots..."}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = form.time === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      onClick={() => {
                        if (!isBooked) {
                          updateField("time", slot);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isBooked
                          ? "opacity-30 cursor-not-allowed line-through text-[var(--text-muted)]"
                          : isSelected
                          ? "bg-[var(--gold)] text-[#0f172a] font-bold"
                          : "border border-white/10 hover:border-[var(--gold)]/50 text-[var(--text-muted)]"
                      }`}
                    >
                      {formatTime(slot)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Duration picker — only for services that allow it */}
          {(() => {
            const svc = getServiceById(service);
            if (!svc?.allowDurationPick) return null;
            const durations = ["1 hour", "2 hours", "3 hours", "4 hours", "5 hours", "6 hours"];
            return (
              <div className="mt-6">
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Visit Duration *
                </label>
                {errors.duration && (
                  <p className="text-red-400 text-xs mb-2">{errors.duration}</p>
                )}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {durations.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setDuration(d); setErrors((prev) => { const n = { ...prev }; delete n.duration; return n; }); }}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        duration === d
                          ? "bg-[var(--gold)] text-[#0f172a] font-bold"
                          : "border border-white/10 hover:border-[var(--gold)]/50 text-[var(--text-muted)]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ================================================================== */}
      {/* STEP 3: Your Details                                               */}
      {/* ================================================================== */}
      {step === 3 && (
        <div className="animate-fade-in space-y-4">
          <h3 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">
            {t("form_yourDetails") || "Your Details"}
          </h3>

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
              {t("form_fullName") || "Full Name"} *
            </label>
            <input
              type="text"
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="John Doe"
              className={inputClass("name")}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                {t("form_email") || "Email"} *
              </label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="john@example.com"
                className={inputClass("email")}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                {t("form_phone") || "Phone"} *
              </label>
              <input
                type="tel"
                id="phone"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+971 50 123 4567"
                className={inputClass("phone")}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Nationality */}
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
              {t("form_nationality") || "Nationality"} *
            </label>
            <select
              id="nationality"
              value={form.nationality}
              onChange={(e) => updateField("nationality", e.target.value)}
              className={inputClass("nationality")}
            >
              <option value="">{t("form_selectNationality") || "Select nationality"}</option>
              {NATIONALITIES.map((nat) => (
                <option key={nat} value={nat}>
                  {nat}
                </option>
              ))}
            </select>
            {errors.nationality && <p className="text-red-400 text-xs mt-1">{errors.nationality}</p>}
          </div>

          {/* Guests */}
          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
              {t("form_guests") || "Guests"} *
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
            {errors.guests && <p className="text-red-400 text-xs mt-1">{errors.guests}</p>}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
              {t("form_message") || "Message"}{" "}
              <span className="opacity-50">({t("form_optional") || "optional"})</span>
            </label>
            <textarea
              id="message"
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              rows={3}
              placeholder="Any special requests..."
              className="w-full px-4 py-2.5 input-dark resize-y"
            />
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* STEP 4: Review & Submit                                            */}
      {/* ================================================================== */}
      {step === 4 && (
        <div className="animate-fade-in space-y-5">
          <h3 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">
            {t("form_reviewBooking") || "Review Your Booking"}
          </h3>

          <div className="glass-card p-5 rounded-xl space-y-5">
            {/* --- Service --- */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {selectedService && (
                  <div className="text-[var(--gold)] mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={selectedService.icon} />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                    {t("form_service") || "Service"}
                  </p>
                  <p className="font-semibold text-sm">
                    {selectedService ? getServiceName(selectedService.id, locale as "en" | "ar") : ""}
                  </p>
                  {selectedService && (
                    <p className="text-xs text-[var(--text-muted)]">{selectedService.estimatedDuration}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[10px] text-[var(--gold)] hover:underline font-medium"
              >
                {t("form_edit") || "Edit"}
              </button>
            </div>

            <div className="border-t border-white/5" />

            {/* --- Date & Time --- */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                  {t("form_dateTime") || "Date & Time"}
                </p>
                <p className="font-semibold text-sm">
                  {form.date} &middot; {form.time ? formatTime(form.time) : ""}
                  {duration && <> &middot; {duration}</>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-[10px] text-[var(--gold)] hover:underline font-medium"
              >
                {t("form_edit") || "Edit"}
              </button>
            </div>

            <div className="border-t border-white/5" />

            {/* --- Personal details --- */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                  {t("form_personalDetails") || "Personal Details"}
                </p>
                <p className="text-sm font-semibold">{form.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{form.email}</p>
                <p className="text-xs text-[var(--text-muted)]">{form.phone}</p>
                <p className="text-xs text-[var(--text-muted)]">{form.nationality}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {form.guests} {Number(form.guests) === 1 ? (t("form_guest") || "guest") : (t("form_guestsLabel") || "guests")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-[10px] text-[var(--gold)] hover:underline font-medium"
              >
                {t("form_edit") || "Edit"}
              </button>
            </div>

            {/* --- Message (if any) --- */}
            {form.message && (
              <>
                <div className="border-t border-white/5" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                      {t("form_message") || "Message"}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">{form.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-[10px] text-[var(--gold)] hover:underline font-medium"
                  >
                    {t("form_edit") || "Edit"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* Navigation Buttons                                                 */}
      {/* ================================================================== */}
      <div className="flex items-center justify-between pt-2">
        {/* Back button (hidden on step 1) */}
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 border border-white/10 text-[var(--text-muted)] hover:bg-white/5 rounded-xl text-sm font-medium transition-all"
          >
            {t("form_back") || "Back"}
          </button>
        ) : (
          <div />
        )}

        {/* Next / Submit */}
        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 btn-gold text-sm font-medium"
          >
            {t("form_next") || "Next"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 btn-gold text-sm font-medium flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? (t("form_submitting") || "Submitting...") : (t("form_submitBooking") || "Submit Booking")}
          </button>
        )}
      </div>
    </div>
  );
}
