import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/components/TRPCProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "LegalMint AI — India's AI-Powered Legal Compliance Platform",
    template: "%s | LegalMint AI",
  },
  description: "Generate compliant legal documents, track compliance, and stay updated with Indian regulations. DPDP Act 2023, IT Act, GST, and more.",
  keywords: ["legal compliance", "India", "DPDP Act", "legal documents", "AI", "business compliance", "GST", "IT Act", "privacy policy", "terms of service"],
  authors: [{ name: "LegalMint AI" }],
  creator: "LegalMint AI",
  publisher: "LegalMint AI",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://legalmint.ai",
    siteName: "LegalMint AI",
    title: "LegalMint AI — India's AI-Powered Legal Compliance Platform",
    description: "Generate compliant legal documents, track compliance, and stay updated with Indian regulations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LegalMint AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LegalMint AI — India's AI-Powered Legal Compliance Platform",
    description: "Generate compliant legal documents, track compliance, and stay updated with Indian regulations.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LegalMint AI",
    description: "India's AI-powered legal compliance platform for automated document generation and regulatory tracking.",
    url: "https://legalmint.ai",
    applicationCategory: "Legal",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    areaServed: "IN",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50`}>
        <ErrorBoundary>
          <ThemeProvider>
            <TRPCProvider>
              {children}
              <LegalDisclaimer className="fixed bottom-0 left-0 right-0 z-40 rounded-none" />
              <Toaster position="top-right" />
              <Analytics />
            </TRPCProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
