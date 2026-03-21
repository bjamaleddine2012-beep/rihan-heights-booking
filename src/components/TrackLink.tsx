"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

export default function TrackLink() {
  const { t } = useLanguage();

  return (
    <p className="text-center text-sm text-[var(--text-muted)] mt-6">
      {t("form_alreadyBooked")}{" "}
      <Link href="/booking/lookup" className="text-gold hover:text-[var(--gold-light)] font-medium transition-colors">
        {t("form_trackHere")}
      </Link>
    </p>
  );
}
