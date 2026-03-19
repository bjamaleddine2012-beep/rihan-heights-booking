import BookingForm from "@/components/BookingForm";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Rihan Heights Tower B701
        </h1>
        <p className="text-gray-600">
          Book an appointment — fill out the form below and we&apos;ll get back to you shortly.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <BookingForm />
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have a booking?{" "}
        <Link href="/booking/lookup" className="text-blue-600 hover:underline font-medium">
          Track it here
        </Link>
      </p>
    </div>
  );
}
