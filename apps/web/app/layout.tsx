import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Link Crust | The Ultimate In-Context Link Smasher",
  description: "Save and retrieve links contextually in 1-click. A sleek keyboard-driven companion extension and web vault designed for developers and researchers.",
  keywords: ["URL shortener", "Link manager", "Chrome extension", "Developer tools", "Bookmark manager", "Contextual search"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} scroll-smooth`}>
      <body className="antialiased selection:bg-brand-magenta/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}

