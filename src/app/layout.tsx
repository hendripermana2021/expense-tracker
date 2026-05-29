import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Workspace } from "@/components/layout/workspace";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aplikasi-keuangan-saya.vercel.app";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Pulse Ledger",
  title: {
    default: "Pulse Ledger | Local-First Expense Tracker",
    template: "%s | Pulse Ledger",
  },
  description:
    "Track spending, wallets, budgets, and trends with a local-first expense tracker that works offline and keeps your data on your device.",
  keywords: [
    "expense tracker",
    "budget tracker",
    "personal finance dashboard",
    "offline expense tracker",
    "local first finance app",
    "wallet balance tracker",
    "spending analytics",
    "budget planner",
  ],
  alternates: {
    canonical: "/",
  },
  category: "finance",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Pulse Ledger",
    title: "Pulse Ledger | Local-First Expense Tracker",
    description:
      "A privacy-first expense tracker with offline access, wallet tracking, smart budgeting, and analytics.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse Ledger | Local-First Expense Tracker",
    description:
      "Track spending and budgets offline with a polished local-first personal finance app.",
  },
  icons: {
    icon: [
      { url: "/logo-mark.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png" },
    ],
    shortcut: "/icon",
    apple: "/logo-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Workspace>{children}</Workspace>
        </Providers>
      </body>
    </html>
  );
}
