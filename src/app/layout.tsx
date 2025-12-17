
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import ClientProviders from "../components/ClientProviders";
import GoogleAnalytics from "../components/GoogleAnalytics";
import MobileBottomNav from "../components/MobileBottomNav";
import WhatsAppChat from "../components/WhatsAppChat";

// Optimize font loading with next/font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ISLE & ECHO - Feel the Isle, Hear The Echo",
    template: "%s | ISLE & ECHO"
  },
  description: "Discover the beauty of Sri Lanka with our curated tour packages and travel experiences. From cultural heritage to pristine beaches, explore the island paradise with ISLE & ECHO.",
  keywords: [
    "Sri Lanka tours",
    "Sri Lanka travel packages", 
    "cultural heritage tours Sri Lanka",
    "beach holidays Sri Lanka",
    "adventure tours Sri Lanka",
    "tea plantation tours",
    "wildlife safaris Sri Lanka",
    "Ella train journey",
    "Sigiriya rock fortress",
    "Galle fort tours",
    "Yala national park",
    "Nuwara Eliya tours",
    "Kandy cultural tours",
    "ISLE & ECHO"
  ],
  authors: [{ name: "ISLE & ECHO" }],
  creator: "ISLE & ECHO",
  publisher: "ISLE & ECHO",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://isleandecho.com",
    siteName: "ISLE & ECHO",
    title: "ISLE & ECHO - Feel the Isle, Hear The Echo",
    description: "Discover the beauty of Sri Lanka with our curated tour packages and travel experiences.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ISLE & ECHO - Sri Lanka Tours",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ISLE & ECHO - Feel the Isle, Hear The Echo",
    description: "Discover the beauty of Sri Lanka with our curated tour packages and travel experiences.",
    images: ["/twitter-image.jpg"],
    creator: "@isleandecho",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://isleandecho.com",
  },
  category: "Travel & Tourism",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="theme-color" content="#1E3A8A" />
      </head>
      <body
        className={`antialiased ${inter.className}`}
        suppressHydrationWarning={true}
      >
        <ClientProviders>
          {children}
          <Footer />
          <MobileBottomNav />
          <WhatsAppChat />
        </ClientProviders>
        
        {/* Analytics */}
        <GoogleAnalytics 
          googleAnalyticsId={process.env.NEXT_PUBLIC_GA_ID}
          googleTagManagerId={process.env.NEXT_PUBLIC_GTM_ID}
        />
      </body>
    </html>
  );
}

