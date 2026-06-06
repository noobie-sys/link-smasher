import { Link2, Home, LayoutDashboard, Search } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Link Crust",
  description: "The page you are looking for does not exist.",
};

/**
 * Global 404 page.
 * Server Component — no need for "use client" since there is no interactivity.
 * Shown by Next.js whenever no route matches the requested path.
 */
export default function NotFound() {
  return (
    <div className="dark min-h-dvh bg-background text-foreground flex items-center justify-center px-6 relative overflow-hidden font-sans">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/5 blur-[110px]" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 grid-pattern opacity-10" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-xl shadow-primary/20">
            <Link2 className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Large 404 display */}
        <div className="space-y-2">
          <p className="font-display text-[8rem] font-black leading-none bg-gradient-to-b from-white/20 to-white/5 bg-clip-text text-transparent select-none">
            404
          </p>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Page not found
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            The link you followed may be broken, or the page may have been
            removed. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Navigation actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-border bg-card/50 hover:bg-card/80 text-white/80 hover:text-white text-sm font-medium transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        {/* Subtle tip */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
          <Search className="h-3 w-3" />
          <span>
            Use{" "}
            <kbd className="px-1.5 py-0.5 text-[10px] rounded border border-border bg-secondary/40 font-mono">
              Alt+K
            </kbd>{" "}
            on any page to search your saved links instantly.
          </span>
        </div>
      </div>
    </div>
  );
}
