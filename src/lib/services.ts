export interface ServiceConfig {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  estimatedDuration: string;
  allowDurationPick?: boolean;
}

export const SERVICES: ServiceConfig[] = [
  {
    id: "visit",
    nameEn: "General Visit",
    nameAr: "زيارة عامة",
    descriptionEn: "Schedule a visit to the apartment",
    descriptionAr: "جدولة زيارة للشقة",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4",
    estimatedDuration: "1-6 hours",
    allowDurationPick: true,
  },
  {
    id: "maintenance",
    nameEn: "Maintenance",
    nameAr: "صيانة",
    descriptionEn: "Request a repair or maintenance service",
    descriptionAr: "طلب خدمة إصلاح أو صيانة",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    estimatedDuration: "1-2 hours",
  },
  {
    id: "pool",
    nameEn: "Pool Access",
    nameAr: "دخول المسبح",
    descriptionEn: "Book a pool session for you and your guests",
    descriptionAr: "احجز جلسة مسبح لك ولضيوفك",
    icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
    estimatedDuration: "2 hours",
  },
  {
    id: "cleaning",
    nameEn: "Deep Cleaning",
    nameAr: "تنظيف عميق",
    descriptionEn: "Professional deep cleaning service",
    descriptionAr: "خدمة تنظيف عميق احترافية",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    estimatedDuration: "3-4 hours",
  },
  {
    id: "delivery",
    nameEn: "Delivery",
    nameAr: "توصيل",
    descriptionEn: "Schedule a delivery or pickup",
    descriptionAr: "جدولة توصيل أو استلام",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    estimatedDuration: "15-30 min",
  },
  {
    id: "other",
    nameEn: "Other",
    nameAr: "أخرى",
    descriptionEn: "Any other request or inquiry",
    descriptionAr: "أي طلب أو استفسار آخر",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    estimatedDuration: "Varies",
  },
];

export function getServiceById(id: string): ServiceConfig | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function getServiceName(id: string, locale: "en" | "ar"): string {
  const service = getServiceById(id);
  if (!service) return id;
  return locale === "ar" ? service.nameAr : service.nameEn;
}
