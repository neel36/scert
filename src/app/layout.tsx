import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
