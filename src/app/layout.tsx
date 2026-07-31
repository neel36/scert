import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BOOKS AND NOTES CG BOARD",
  description: "CG Board की सभी कक्षाओं की किताबें, नोट्स और अध्ययन सामग्री — हिंदी व अंग्रेजी माध्यम में, ऑफलाइन पढ़ने की सुविधा के साथ।",
  keywords: ["CG Board", "Books", "Notes", "Chhattisgarh", "PDF Reader", "Hindi Medium", "English Medium"],
  authors: [{ name: "CG Board Books" }],
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CG Board Books",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" suppressHydrationWarning className="select-none">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground touch-manipulation overscroll-none`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
