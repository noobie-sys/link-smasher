import type { Metadata } from "next";
import { Inter, Outfit, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "LNKR | The Ultimate In-Context Link Companion",
  description: "Save and retrieve links contextually in 1-click. A sleek keyboard-driven companion extension and web vault designed for developers and researchers.",
  keywords: ["Link manager", "Chrome extension", "Developer tools", "Bookmark manager", "Contextual search"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("scroll-smooth", outfit.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="antialiased selection:bg-brand-magenta/30 selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

