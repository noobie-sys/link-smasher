import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LNKR — Save Links. Find Them Instantly.",
  description: "The keyboard-first browser extension that saves, organizes, and retrieves your links — filtered to the exact site you're on. Join the early access waitlist.",
  keywords: ["Link manager", "Chrome extension", "Developer tools", "Bookmark manager", "Waitlist"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("scroll-smooth", bricolage.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="antialiased selection:bg-brand-magenta/30 selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

