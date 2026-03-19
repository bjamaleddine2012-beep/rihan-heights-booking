import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rihan Heights Tower B701 — Booking",
  description: "Book your appointment at Rihan Heights Tower B701",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <a href="/" className="text-xl font-bold text-blue-600">
                Rihan Heights <span className="text-gray-500 font-normal text-sm">B701</span>
              </a>
              <div className="flex gap-4 text-sm">
                <a
                  href="/"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Book Now
                </a>
                <a
                  href="/booking/lookup"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Track Booking
                </a>
                <a
                  href="/admin"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Admin
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-auto">
          <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Rihan Heights Tower B701. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
