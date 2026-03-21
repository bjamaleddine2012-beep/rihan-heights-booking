import BookingForm from "@/components/BookingForm";
import HomeHero from "@/components/HomeHero";
import TrackLink from "@/components/TrackLink";

export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <section className="max-w-xl mx-auto px-4 -mt-8 relative z-20 pb-16">
        <div className="glass-card p-6 sm:p-8 animate-fade-in">
          <BookingForm />
        </div>
        <TrackLink />
      </section>
    </div>
  );
}
