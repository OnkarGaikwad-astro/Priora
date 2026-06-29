import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://priora.astronkar.in'),
  title: "Priora | Finish Before It's Urgent",
  description: "The luxury AI Productivity Operating System.",
  keywords: ["productivity", "AI", "operating system", "task management", "Priora", "luxury software"],
  authors: [{ name: "Priora Team" }],
  openGraph: {
    title: "Priora | Finish Before It's Urgent",
    description: "The luxury AI Productivity Operating System.",
    url: "/",
    siteName: "Priora",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Priora | Finish Before It's Urgent",
    description: "The luxury AI Productivity Operating System.",
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE", // Replace this!
  },
};
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} h-full antialiased bg-[var(--color-bg-main)]`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Script id="register-sw" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
