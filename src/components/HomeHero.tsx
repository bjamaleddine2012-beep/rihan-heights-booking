"use client";

import { useLanguage } from "./LanguageProvider";

export default function HomeHero() {
  const { t } = useLanguage();

  return (
    <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/70 via-[#0f172a]/50 to-[#0f172a]" />
      <div className="relative z-10 text-center px-4 animate-fade-in">
        <p className="text-gold text-sm font-medium tracking-[0.3em] uppercase mb-4">
          {t("hero_welcome")}
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
          {t("hero_title")}
        </h1>
        <p className="text-2xl sm:text-3xl text-gold font-light mb-6">
          {t("hero_subtitle")}
        </p>
        <p className="text-[var(--text-muted)] max-w-md mx-auto text-lg">
          {t("hero_desc")}
        </p>
      </div>
    </section>
  );
}
