export type Locale = "en" | "ar";

export const translations = {
  en: {
    // Nav
    nav_bookNow: "Book Now",
    nav_trackBooking: "Track Booking",
    nav_admin: "Admin",

    // Hero
    hero_welcome: "Welcome to",
    hero_title: "Rihan Heights",
    hero_subtitle: "Tower B701",
    hero_desc: "Book your appointment with ease",

    // Booking form
    form_title: "Make a Reservation",
    form_yourDetails: "Your Details",
    form_bookingDetails: "Booking Details",
    form_fullName: "Full Name",
    form_email: "Email Address",
    form_phone: "Phone Number",
    form_nationality: "Nationality",
    form_selectNationality: "Select your nationality",
    form_date: "Date",
    form_time: "Time",
    form_guests: "Guests",
    form_message: "Message",
    form_optional: "optional",
    form_submit: "Submit Booking",
    form_submitting: "Submitting...",
    form_alreadyBooked: "Already have a booking?",
    form_trackHere: "Track it here",

    // Wizard
    wizard_step1: "Service",
    wizard_step2: "Date & Time",
    wizard_step3: "Details",
    wizard_step4: "Review",
    wizard_next: "Next",
    wizard_back: "Back",
    wizard_selectService: "Select a service to continue",
    val_serviceRequired: "Please select a service",
    timeslot_title: "Select a Time",
    timeslot_booked: "Booked",
    timeslot_available: "Available",
    review_title: "Review Your Booking",
    review_service: "Service",
    review_edit: "Edit",

    // Validation
    val_nameMin: "Name must be at least 2 characters",
    val_emailRequired: "Email is required",
    val_emailInvalid: "Please enter a valid email (e.g. name@example.com)",
    val_emailTypo: "Did you make a typo in the email domain?",
    val_phoneRequired: "Phone number is required",
    val_phoneDigits: "Phone number can only contain digits, +, spaces, and dashes",
    val_phoneMin: "Phone number must have at least 7 digits",
    val_phoneLong: "Phone number is too long",
    val_nationalityRequired: "Please select your nationality",
    val_dateRequired: "Please select a date",
    val_timeRequired: "Please select a time",
    val_guestsRange: "Guests must be 1-20",

    // Success
    success_title: "Booking Submitted!",
    success_desc: "Thank you for your request. We'll review it and notify you by email.",
    success_refTitle: "Your Reference Number",
    success_refSave: "Save this to track your booking",
    success_whatsNext: "What Happens Next",
    success_step1: "Submitted",
    success_step1Desc: "Your booking has been received",
    success_step2: "Under Review",
    success_step2Desc: "We'll review your request shortly",
    success_step3: "Confirmation",
    success_step3Desc: "You'll get an email with the decision",
    success_trackBooking: "Track My Booking",
    success_makeAnother: "Make Another Booking",

    // Lookup
    lookup_title: "Track Your Booking",
    lookup_desc: "Look up by reference number or email address.",
    lookup_refTab: "Reference Number",
    lookup_emailTab: "Email Address",
    lookup_search: "Look Up Booking",
    lookup_searching: "Searching...",
    lookup_notFound: "No booking found with that reference.",
    lookup_noEmail: "No bookings found for this email.",
    lookup_error: "Something went wrong. Please try again.",
    lookup_bookingsFound: "booking(s) found",
    lookup_guest: "guest",
    lookup_guests: "guests",

    // Detail
    detail_status: "Booking Status",
    detail_bookingDetails: "Booking Details",
    detail_name: "Name",
    detail_date: "Date",
    detail_time: "Time",
    detail_timeline: "Status",
    detail_pending: "Your booking is being reviewed. You'll receive an email when it's confirmed.",
    detail_approved: "Your booking is confirmed!",
    detail_rejected: "Unfortunately this booking couldn't be accommodated. You can submit a new booking.",
    detail_arrivalTitle: "Arrival Tracking",
    detail_arrivalDesc: "Let us know when you're on your way!",
    detail_onMyWay: "I'm on my way",
    detail_onTheWay: "On The Way",
    detail_arrived: "Arrived",
    detail_lastUpdated: "Last updated",
    detail_bookAgain: "Book Again",
    detail_newBooking: "New Booking",
    detail_trackAnother: "Track Another",
    detail_downloadQR: "Download QR Code",
    detail_downloadCal: "Add to Calendar",

    // OTP
    otp_title: "Verify Your Phone",
    otp_desc: "We'll send a verification code to your phone number.",
    otp_send: "Send Code",
    otp_sending: "Sending...",
    otp_enterCode: "Enter the 6-digit code sent to",
    otp_verify: "Verify",
    otp_verifying: "Verifying...",
    otp_resend: "Resend Code",
    otp_verified: "Phone verified",
    otp_change: "Change",

    // Chat
    chat_greeting: "Hello! I'm Bassem, your personal concierge. How can I assist you today?",
    chat_placeholder: "Ask me anything...",

    // Footer
    footer_rights: "All rights reserved.",

    // General
    general_error: "Something went wrong",
  },

  ar: {
    // Nav
    nav_bookNow: "احجز الآن",
    nav_trackBooking: "تتبع الحجز",
    nav_admin: "المسؤول",

    // Hero
    hero_welcome: "مرحباً بكم في",
    hero_title: "ريحان هايتس",
    hero_subtitle: "برج B701",
    hero_desc: "احجز موعدك بكل سهولة",

    // Booking form
    form_title: "قم بالحجز",
    form_yourDetails: "بياناتك الشخصية",
    form_bookingDetails: "تفاصيل الحجز",
    form_fullName: "الاسم الكامل",
    form_email: "البريد الإلكتروني",
    form_phone: "رقم الهاتف",
    form_nationality: "الجنسية",
    form_selectNationality: "اختر جنسيتك",
    form_date: "التاريخ",
    form_time: "الوقت",
    form_guests: "عدد الضيوف",
    form_message: "رسالة",
    form_optional: "اختياري",
    form_submit: "إرسال الحجز",
    form_submitting: "جارٍ الإرسال...",
    form_alreadyBooked: "لديك حجز بالفعل؟",
    form_trackHere: "تتبعه هنا",

    // Wizard
    wizard_step1: "الخدمة",
    wizard_step2: "التاريخ والوقت",
    wizard_step3: "البيانات",
    wizard_step4: "مراجعة",
    wizard_next: "التالي",
    wizard_back: "رجوع",
    wizard_selectService: "اختر خدمة للمتابعة",
    val_serviceRequired: "يرجى اختيار خدمة",
    timeslot_title: "اختر الوقت",
    timeslot_booked: "محجوز",
    timeslot_available: "متاح",
    review_title: "مراجعة حجزك",
    review_service: "الخدمة",
    review_edit: "تعديل",

    // Validation
    val_nameMin: "الاسم يجب أن يكون حرفين على الأقل",
    val_emailRequired: "البريد الإلكتروني مطلوب",
    val_emailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
    val_emailTypo: "هل هناك خطأ في عنوان البريد؟",
    val_phoneRequired: "رقم الهاتف مطلوب",
    val_phoneDigits: "رقم الهاتف يمكن أن يحتوي فقط على أرقام و + ومسافات وشرطات",
    val_phoneMin: "رقم الهاتف يجب أن يحتوي على 7 أرقام على الأقل",
    val_phoneLong: "رقم الهاتف طويل جداً",
    val_nationalityRequired: "يرجى اختيار جنسيتك",
    val_dateRequired: "يرجى اختيار التاريخ",
    val_timeRequired: "يرجى اختيار الوقت",
    val_guestsRange: "عدد الضيوف يجب أن يكون بين 1 و 20",

    // Success
    success_title: "تم إرسال الحجز!",
    success_desc: "شكراً لطلبك. سنراجعه ونبلغك عبر البريد الإلكتروني.",
    success_refTitle: "رقم المرجع الخاص بك",
    success_refSave: "احفظ هذا لتتبع حجزك",
    success_whatsNext: "ماذا بعد",
    success_step1: "تم الإرسال",
    success_step1Desc: "تم استلام حجزك",
    success_step2: "قيد المراجعة",
    success_step2Desc: "سنراجع طلبك قريباً",
    success_step3: "التأكيد",
    success_step3Desc: "ستتلقى بريداً إلكترونياً بالقرار",
    success_trackBooking: "تتبع حجزي",
    success_makeAnother: "حجز جديد",

    // Lookup
    lookup_title: "تتبع حجزك",
    lookup_desc: "ابحث برقم المرجع أو البريد الإلكتروني.",
    lookup_refTab: "رقم المرجع",
    lookup_emailTab: "البريد الإلكتروني",
    lookup_search: "البحث عن الحجز",
    lookup_searching: "جارٍ البحث...",
    lookup_notFound: "لم يتم العثور على حجز بهذا المرجع.",
    lookup_noEmail: "لم يتم العثور على حجوزات لهذا البريد.",
    lookup_error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    lookup_bookingsFound: "حجز(ات) تم العثور عليها",
    lookup_guest: "ضيف",
    lookup_guests: "ضيوف",

    // Detail
    detail_status: "حالة الحجز",
    detail_bookingDetails: "تفاصيل الحجز",
    detail_name: "الاسم",
    detail_date: "التاريخ",
    detail_time: "الوقت",
    detail_timeline: "الحالة",
    detail_pending: "حجزك قيد المراجعة. ستتلقى بريداً إلكترونياً عند التأكيد.",
    detail_approved: "تم تأكيد حجزك!",
    detail_rejected: "للأسف لم نتمكن من استيعاب هذا الحجز. يمكنك تقديم حجز جديد.",
    detail_arrivalTitle: "تتبع الوصول",
    detail_arrivalDesc: "أخبرنا عندما تكون في الطريق!",
    detail_onMyWay: "أنا في الطريق",
    detail_onTheWay: "في الطريق",
    detail_arrived: "وصلت",
    detail_lastUpdated: "آخر تحديث",
    detail_bookAgain: "احجز مجدداً",
    detail_newBooking: "حجز جديد",
    detail_trackAnother: "تتبع حجز آخر",
    detail_downloadQR: "تحميل رمز QR",
    detail_downloadCal: "إضافة للتقويم",

    // OTP
    otp_title: "تحقق من هاتفك",
    otp_desc: "سنرسل رمز تحقق إلى رقم هاتفك.",
    otp_send: "إرسال الرمز",
    otp_sending: "جارٍ الإرسال...",
    otp_enterCode: "أدخل الرمز المكون من 6 أرقام المرسل إلى",
    otp_verify: "تحقق",
    otp_verifying: "جارٍ التحقق...",
    otp_resend: "إعادة إرسال الرمز",
    otp_verified: "تم التحقق من الهاتف",
    otp_change: "تغيير",

    // Chat
    chat_greeting: "مرحباً! أنا باسم، مساعدك الشخصي. كيف يمكنني مساعدتك اليوم؟",
    chat_placeholder: "اسألني أي شيء...",

    // Footer
    footer_rights: "جميع الحقوق محفوظة.",

    // General
    general_error: "حدث خطأ",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(locale: Locale, key: TranslationKey): string {
  const dict = translations[locale] as Record<string, string>;
  const fallback = translations.en as Record<string, string>;
  return dict[key] || fallback[key] || key;
}
