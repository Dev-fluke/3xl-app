import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3xl - Muscle Preservation & Weight Loss",
  description: "Dynamic habit tracking for weight loss and muscle preservation.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "3xl",
  },
};

import AuthProvider from "@/components/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-100 flex justify-center`}
      >
        <div className="w-full max-w-md min-h-screen bg-white relative pb-16 shadow-xl overflow-x-hidden">
          <AuthProvider>
            {children}
            <BottomNav />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
