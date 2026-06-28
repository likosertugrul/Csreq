import type { Metadata } from "next";
import { IBM_Plex_Serif, Inter, Courier_Prime } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

const APP_URL = "https://csreq.likosertugrul.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "csreq — CouchSurfing Couch Request Writer",
    template: "%s | csreq",
  },
  description:
    "Write a personalized CouchSurfing couch request in seconds. Paste the host's profile, pick your dates — get a genuine, human-sounding letter. No AI fingerprint, 25 languages, 995-character limit enforced.",
  keywords: [
    "couchsurfing request",
    "couch request writer",
    "couchsurfing message",
    "couchsurfing letter generator",
    "couch request letter",
    "couchsurfing couch request",
    "how to write couchsurfing request",
    "couchsurfing request template",
    "couch surfing request",
    "couchsurfing request AI",
  ],
  authors: [{ name: "csreq" }],
  creator: "csreq",
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "csreq",
    title: "csreq — Write Better CouchSurfing Requests",
    description:
      "Paste the host's profile. Pick your dates. Get a genuine, personalized letter in seconds — no AI clichés, no truncated messages.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "csreq — CouchSurfing Couch Request Writer",
    description:
      "Write personalized CouchSurfing requests in seconds. Human-sounding, 25 languages, character limit enforced.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${ibmPlexSerif.variable} ${inter.variable} ${courierPrime.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){var t=localStorage.getItem('csreq_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);})();`}</Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "csreq",
            url: "https://csreq.likosertugrul.com",
            description: "Write personalized CouchSurfing couch request letters in seconds. AI-powered, human-sounding, 25 languages.",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "5 free letters, no credit card required",
            },
            featureList: [
              "Personalized CouchSurfing request letters",
              "25 language support",
              "AI writing pattern detection and removal",
              "Host profile analysis",
              "Character limit enforcement",
              "Host condition warnings",
            ],
          }) }}
        />
        <div className="noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
