"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

interface SettingsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Settings-level error boundary.
 * Must be a Client Component as required by Next.js for error.tsx files.
 */
export default function SettingsError({ error, reset }: SettingsErrorProps) {
  useEffect(() => {
    console.error("[Settings Error]", error);
  }, [error]);

  return (
    <div className="dark min-h-dvh bg-background text-foreground flex items-center justify-center px-6">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/8 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center shadow-lg shadow-destructive/5">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Settings unavailable
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Could not load your settings. Your saved links are safe — only this
            page encountered an issue.
          </p>
          {process.env.NODE_ENV === "development" && error.message && (
            <p className="text-xs font-mono text-destructive/70 bg-destructive/5 border border-destructive/15 rounded-lg px-3 py-2 mt-3 text-left break-all">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          <a
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card/50 hover:bg-card/80 text-white/80 hover:text-white text-sm font-medium transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </a>
        </div>

        {error.digest && (
          <p className="text-[10px] text-muted-foreground/50 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
