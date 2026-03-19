import type { Metadata } from "next";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";

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
      <body className="min-h-screen antialiased">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <a href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold text-gold">Rihan Heights</span>
                <span className="text-xs text-[var(--text-muted)] font-medium tracking-widest uppercase">B701</span>
              </a>
              <div className="flex gap-6 text-sm">
                <a href="/" className="text-[var(--text-muted)] hover:text-gold transition-colors">
                  Book Now
                </a>
                <a href="/booking/lookup" className="text-[var(--text-muted)] hover:text-gold transition-colors">
                  Track Booking
                </a>
                <a href="/admin" className="text-[var(--text-muted)] hover:text-gold transition-colors">
                  Admin
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Page content — padded for fixed nav */}
        <main className="pt-16">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Rihan Heights Tower B701. All rights reserved.
          </div>
        </footer>

        {/* AI Chat Widget */}
        <ChatWidget />
      </body>
    </html>
  );
}
