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
    "Write a personalized CouchSurfing couch request in seconds. Paste the host's profile, pick your dates — get a human-sounding couch request letter that actually gets replies. No AI clichés, 25 languages, 995-character limit enforced.",
  keywords: [
    "couchsurfing request",
    "couchsurfing couch request",
    "couch request",
    "couch request writer",
    "couchsurfing message",
    "couchsurfing letter",
    "couch request letter",
    "how to write couchsurfing request",
    "couchsurfing request generator",
    "couchsurfing request template",
    "couch surfing request",
    "cs request",
    "host request couchsurfing",
    "write couchsurfing message",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ibmPlexSerif.variable} ${inter.variable} ${courierPrime.variable} h-full`} suppressHydrationWarning>
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
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "5 free letters, no credit card required" },
            featureList: ["Personalized CouchSurfing request letters","25 language support","AI writing pattern detection","Host profile analysis","Character limit enforcement","Host condition warnings"],
          }) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "How do I write a good CouchSurfing couch request?", acceptedAnswer: { "@type": "Answer", text: "A good CouchSurfing request references specific details from the host's profile, stays under 995 characters (the platform's limit), avoids generic AI phrases, and ends with a genuine question. csreq handles all of this automatically." } },
              { "@type": "Question", name: "What is the character limit for CouchSurfing requests?", acceptedAnswer: { "@type": "Answer", text: "CouchSurfing cuts off request messages at 995 characters. csreq enforces this limit server-side, trimming at a natural sentence boundary so your message always reads as complete." } },
              { "@type": "Question", name: "Why do CouchSurfing requests get rejected?", acceptedAnswer: { "@type": "Answer", text: "Most requests are rejected because they're generic and could be sent to anyone. Hosts value personalization — referencing their specific interests, home description, or travel philosophy. csreq reads the host's actual profile to write a letter tailored to them." } },
              { "@type": "Question", name: "Can I write a CouchSurfing request in different languages?", acceptedAnswer: { "@type": "Answer", text: "Yes. csreq supports 25 languages. You can write your letter in the host's native language or any language you prefer." } },
              { "@type": "Question", name: "Is csreq free?", acceptedAnswer: { "@type": "Answer", text: "csreq offers 5 free letters with no credit card required. Pro plans are available for unlimited letters." } },
            ],
          }) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Write a CouchSurfing Couch Request",
            description: "Write a personalized, accepted CouchSurfing request in 3 steps using csreq.",
            step: [
              { "@type": "HowToStep", position: 1, name: "Paste the host's profile", text: "Copy the text from the host's CouchSurfing page — profile, home section, or references — and paste it into csreq." },
              { "@type": "HowToStep", position: 2, name: "Pick your dates", text: "Set your arrival and departure. The letter automatically mentions how long you plan to stay." },
              { "@type": "HowToStep", position: 3, name: "Read and send your letter", text: "A personalized, human-sounding letter appears in seconds. Edit freely, copy, and paste it into CouchSurfing." },
            ],
            totalTime: "PT1M",
            tool: [{ "@type": "HowToTool", name: "csreq", url: "https://csreq.likosertugrul.com" }],
          }) }}
        />
        <div className="noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
