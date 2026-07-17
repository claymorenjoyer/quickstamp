import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickStamp — Drink, Stamp, Earn",
  description: "Self-hosted coffee shop loyalty platform — drink coffee, stamp your card, earn free drinks",
  icons: { icon: "/icon-512.png", apple: "/icon-512.png" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "QuickStamp",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#92400e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <SessionProvider>{children}</SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
