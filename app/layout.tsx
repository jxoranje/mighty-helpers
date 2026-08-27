import type { Metadata } from "next";
import { Geist, DM_Sans, Fraunces } from "next/font/google";
import { FooterLegalLinks } from "./components/footer-legal-links";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mighty Helpers",
  description: "A playful family chores app for kids, stars, rewards, and household management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <div className="flex-1">{children}</div>

        <footer className="border-t border-[var(--border-soft)] px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <FooterLegalLinks />
          </div>
        </footer>
      </body>
    </html>
  );
}