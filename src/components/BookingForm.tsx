"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import PhoneVerification from "./PhoneVerification";

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

type Recurrence = "none" | "weekly" | "biweekly" | "monthly";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  date?: string;
  time?: string;
  guests?: string;
}

export default function BookingForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [recurrence, setRecurrence] = useState<Recurrence>("none");

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

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Reset phone verification if phone changes
    if (field === "phone") setPhoneVerified(false);
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.name || form.name.trim().length < 2)
      newErrors.name = t("val_nameMin");

    if (!form.email) {
      newErrors.email = t("val_emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      newErrors.email = t("val_emailInvalid");
    } else if (/\.(con|cmo|coom|gmial|gamil|yahooo)$/i.test(form.email)) {
      newErrors.email = t("val_emailTypo");
    }

    if (!form.phone) {
      newErrors.phone = t("val_phoneRequired");
    } else {
      const digitsOnly = form.phone.replace(/[\s\-\(\)\+]/g, "");
      if (!/^\d+$/.test(digitsOnly)) {
        newErrors.phone = t("val_phoneDigits");
      } else if (digitsOnly.length < 7) {
        newErrors.phone = t("val_phoneMin");
      } else if (digitsOnly.length > 15) {
        newErrors.phone = t("val_phoneLong");
      }
    }

    if (!form.nationality) newErrors.nationality = t("val_nationalityRequired");
    if (!form.date) newErrors.date = t("val_dateRequired");
    if (!form.time) newErrors.time = t("val_timeRequired");

    const guestsNum = Number(form.guests);
    if (!guestsNum || guestsNum < 1 || guestsNum > 20) newErrors.guests = t("val_guestsRange");

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
        body: JSON.stringify({ ...form, recurrence }),
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
    `w-full px-4 py-2.5 input-dark ${errors[field] ? "input-error" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="text-lg font-semibold text-gold text-center tracking-wide">
        {t("form_title")}
      </h2>

      {serverError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-fade-in">
          {serverError}
        </div>
      )}

      {/* Section 1: Your Details */}
      <div>
        <h3 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">
          {t("form_yourDetails")}
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
              {t("form_fullName")} *
            </label>
            <input type="text" id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="John Doe" className={inputClass("name")} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                {t("form_email")} *
              </label>
              <input type="email" id="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="john@example.com" className={inputClass("email")} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
                {t("form_phone")} *
              </label>
              <input type="tel" id="phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+971 50 123 4567" className={inputClass("phone")} />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Phone OTP Verification */}
          {form.phone && form.phone.replace(/\D/g, "").length >= 7 && (
            <PhoneVerification phone={form.phone} onVerified={() => setPhoneVerified(true)} verified={phoneVerified} />
          )}

          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
              {t("form_nationality")} *
            </label>
            <select id="nationality" value={form.nationality} onChange={(e) => updateField("nationality", e.target.value)} className={inputClass("nationality")}>
              <option value="">{t("form_selectNationality")}</option>
              {NATIONALITIES.map((nat) => (
                <option key={nat} value={nat}>{nat}</option>
              ))}
            </select>
            {errors.nationality && <p className="text-red-400 text-xs mt-1">{errors.nationality}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5" />

      {/* Section 2: Booking Details */}
      <div>
        <h3 className="text-xs font-semibold text-gold uppercase tracking-[0.2em] mb-4">
          {t("form_bookingDetails")}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">{t("form_date")} *</label>
              <input type="date" id="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} min={today} className={inputClass("date")} />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">{t("form_time")} *</label>
              <input type="time" id="time" value={form.time} onChange={(e) => updateField("time", e.target.value)} className={inputClass("time")} />
              {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
            </div>
            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">{t("form_guests")} *</label>
              <input type="number" id="guests" value={form.guests} onChange={(e) => updateField("guests", e.target.value)} min="1" max="20" className={inputClass("guests")} />
              {errors.guests && <p className="text-red-400 text-xs mt-1">{errors.guests}</p>}
            </div>
          </div>

          {/* Recurring Booking */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              {t("form_recurring")}
            </label>
            <div className="flex flex-wrap gap-2">
              {([
                { key: "none", label: t("form_oneTime") },
                { key: "weekly", label: t("form_weekly") },
                { key: "biweekly", label: t("form_biweekly") },
                { key: "monthly", label: t("form_monthly") },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRecurrence(opt.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    recurrence === opt.key
                      ? "bg-gold text-[#0f172a]"
                      : "border border-white/10 text-[var(--text-muted)] hover:bg-white/5"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {recurrence !== "none" && (
              <p className="text-xs text-[var(--text-muted)] mt-2">
                {t("form_recurrenceNote")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">
              {t("form_message")} <span className="opacity-50">({t("form_optional")})</span>
            </label>
            <textarea id="message" value={form.message} onChange={(e) => updateField("message", e.target.value)} rows={3} placeholder="Any special requests..." className="w-full px-4 py-2.5 input-dark resize-y" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full py-3 px-6 btn-gold flex items-center justify-center gap-2 text-base">
        {loading && (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? t("form_submitting") : t("form_submit")}
      </button>
    </form>
  );
}
