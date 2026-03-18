import Link from "next/link";

export default function BookingSuccessPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Booking Submitted!
      </h1>
      <p className="text-gray-600 mb-8">
        Thank you for your booking request. We&apos;ll review it and get back to
        you via email.
      </p>
      <Link
        href="/"
        className="inline-block bg-blue-600 text-white py-2.5 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Make Another Booking
      </Link>
    </div>
  );
}
