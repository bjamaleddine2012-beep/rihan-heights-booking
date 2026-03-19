import BookingForm from "@/components/BookingForm";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80')",
          }}
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/70 via-[#0f172a]/50 to-[#0f172a]" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 animate-fade-in">
          <p className="text-gold text-sm font-medium tracking-[0.3em] uppercase mb-4">
            Welcome to
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Rihan Heights
          </h1>
          <p className="text-2xl sm:text-3xl text-gold font-light mb-6">
            Tower B701
          </p>
          <p className="text-[var(--text-muted)] max-w-md mx-auto text-lg">
            Book your appointment with ease
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="max-w-xl mx-auto px-4 -mt-8 relative z-20 pb-16">
        <div className="glass-card p-6 sm:p-8 animate-fade-in">
          <h2 className="text-lg font-semibold text-gold mb-6 text-center tracking-wide">
            Make a Reservation
          </h2>
          <BookingForm />
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have a booking?{" "}
          <Link href="/booking/lookup" className="text-gold hover:text-[var(--gold-light)] font-medium transition-colors">
            Track it here
          </Link>
        </p>
      </section>
    </div>
  );
}
