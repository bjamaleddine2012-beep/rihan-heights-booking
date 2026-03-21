import type { Metadata, Viewport } from "next";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import { LanguageProvider } from "@/components/LanguageProvider";
import NavBar from "@/components/NavBar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Rihan Heights Tower B701 — Booking",
  description: "Book your appointment at Rihan Heights Tower B701",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rihan Heights",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
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
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
