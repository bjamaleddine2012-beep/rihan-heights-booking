"use client";

import { useLanguage, LanguageToggle } from "./LanguageProvider";

export default function NavBar() {
  const { t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gold">Rihan Heights</span>
            <span className="text-xs text-[var(--text-muted)] font-medium tracking-widest uppercase">B701</span>
          </a>
          <div className="flex items-center gap-4 text-sm">
            <a href="/" className="text-[var(--text-muted)] hover:text-gold transition-colors">
              {t("nav_bookNow")}
            </a>
            <a href="/booking/lookup" className="text-[var(--text-muted)] hover:text-gold transition-colors">
              {t("nav_trackBooking")}
            </a>
            <a href="/booking/history" className="text-[var(--text-muted)] hover:text-gold transition-colors">
              My Bookings
            </a>
            <a href="/admin" className="text-[var(--text-muted)] hover:text-gold transition-colors">
              {t("nav_admin")}
            </a>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
