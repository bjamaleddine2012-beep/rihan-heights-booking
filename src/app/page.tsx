import BookingForm from "@/components/BookingForm";

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
    </div>
  );
}
