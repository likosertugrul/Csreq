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

export const metadata: Metadata = {
  title: "csreq",
  description: "CouchSurfing couch request writer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${ibmPlexSerif.variable} ${inter.variable} ${courierPrime.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){var t=localStorage.getItem('csreq_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);})();`}</Script>
        <div className="noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
