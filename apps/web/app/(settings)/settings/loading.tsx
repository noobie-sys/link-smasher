/**
 * Settings page loading skeleton.
 * Displayed while any async data on the settings page is being fetched.
 */
export default function SettingsLoading() {
  return (
    <div className="dark min-h-dvh bg-background text-foreground pb-12 font-sans">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      </div>

      {/* Header skeleton */}
      <header className="relative z-10 mx-4 md:mx-6 mt-4 border border-border bg-card/65 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg max-w-4xl lg:mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 animate-pulse" />
            <div className="h-5 w-32 rounded bg-white/10 animate-pulse" />
          </div>
          <div className="h-8 w-20 rounded-lg bg-white/5 animate-pulse" />
        </div>
      </header>

      {/* Content skeleton */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 mt-8 space-y-6">
        {/* Page title */}
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-4 w-72 rounded bg-white/5 animate-pulse" />
        </div>

        {/* Settings section cards */}
        {Array.from({ length: 3 }).map((_, sectionIdx) => (
          <div
            key={sectionIdx}
            className="rounded-2xl border border-white/[0.08] bg-card/45 p-6 shadow-md space-y-4"
          >
            {/* Section header */}
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <div className="h-5 w-5 rounded bg-white/10 animate-pulse" />
              <div className="h-5 w-36 rounded bg-white/10 animate-pulse" />
            </div>

            {/* Section rows */}
            {Array.from({ length: 3 }).map((_, rowIdx) => (
              <div key={rowIdx} className="flex items-center justify-between py-1">
                <div className="space-y-1">
                  <div className="h-4 w-40 rounded bg-white/[0.08] animate-pulse" />
                  <div className="h-3 w-56 rounded bg-white/[0.04] animate-pulse" />
                </div>
                <div className="h-8 w-24 rounded-lg bg-white/[0.06] animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
