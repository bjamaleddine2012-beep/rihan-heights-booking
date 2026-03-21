import type { Metadata } from "next";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import { LanguageProvider } from "@/components/LanguageProvider";
import NavBar from "@/components/NavBar";

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
        <LanguageProvider>
          <NavBar />
          <main className="pt-16">{children}</main>
          <footer className="border-t border-white/5 mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()} Rihan Heights Tower B701. All rights reserved.
            </div>
          </footer>
          <ChatWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
