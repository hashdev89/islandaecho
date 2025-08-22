
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import ClientProviders from "../components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ISLE & ECHO - Feel the Isle, Hear The Echo",
  description: "Discover the beauty of Sri Lanka with our curated tour packages and travel experiences. From cultural heritage to pristine beaches, explore the island paradise with ISLE & ECHO.",
  keywords: "Sri Lanka, travel, tours, tourism, cultural heritage, beaches, adventure, ISLE & ECHO",
  authors: [{ name: "ISLE & ECHO" }],
  openGraph: {
    title: "ISLE & ECHO - Feel the Isle, Hear The Echo",
    description: "Discover the beauty of Sri Lanka with our curated tour packages and travel experiences.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ClientProviders>
          {children}
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}

