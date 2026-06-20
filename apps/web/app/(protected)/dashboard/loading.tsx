/**
 * Dashboard loading skeleton.
 * Shown by Next.js while the server component data is being fetched.
 * Uses inline CSS-compatible Tailwind classes for the skeleton shimmer effect.
 */
export default function DashboardLoading() {
  return (
    <div className="dark min-h-dvh bg-background text-foreground relative pb-12 font-sans overflow-x-hidden">
      {/* Background orbs — kept for visual continuity with the real page */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/4 top-1/4 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/5 blur-[110px] animate-pulse [animation-delay:3s]" />
      </div>

      {/* Skeleton Header */}
      <header className="sticky top-4 z-50 mx-4 md:mx-6 mt-4 border border-border bg-card/65 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg max-w-6xl lg:mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-white/10 animate-pulse" />
              <div className="h-2.5 w-20 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block h-8 w-40 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-white/5 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Skeleton Main Grid */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT — Extension Simulator Panel skeleton */}
        <section className="lg:col-span-4 flex justify-center w-full">
          <div className="w-[370px] shrink-0 rounded-2xl border border-white/[0.08] bg-card/65 p-5 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-white/5 animate-pulse" />
            </div>

            {/* Form skeleton */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-2.5 w-20 rounded bg-white/5 animate-pulse" />
                <div className="h-9 w-full rounded-md bg-white/[0.04] animate-pulse" />
              </div>
            ))}

            <div className="h-9 w-full rounded-lg bg-primary/20 animate-pulse" />

            <div className="pt-4 border-t border-border space-y-3">
              <div className="h-8 w-full rounded-md bg-white/[0.04] animate-pulse" />
              <div className="h-20 w-full rounded-lg bg-white/[0.03] animate-pulse" />
            </div>
          </div>
        </section>

        {/* RIGHT — Link list skeleton */}
        <section className="lg:col-span-8 space-y-6 w-full">
          {/* Category tabs skeleton */}
          <div className="p-1 bg-card/45 border border-border rounded-xl flex items-center gap-1.5 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-7 w-16 rounded-lg bg-white/[0.04] animate-pulse shrink-0" />
            ))}
          </div>

          {/* Link cards grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.08] bg-card/45 p-4 space-y-3 shadow-md"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="h-5 w-20 rounded-full bg-white/10 animate-pulse" />
                  <div className="h-3.5 w-16 rounded bg-white/5 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
                  <div className="h-3 w-full rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-white/[0.06] animate-pulse" />
                </div>
                <div className="flex gap-1.5 pt-1">
                  <div className="h-5 w-12 rounded-full bg-white/5 animate-pulse" />
                  <div className="h-5 w-16 rounded-full bg-white/5 animate-pulse" />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <div className="h-7 w-16 rounded-md bg-white/5 animate-pulse" />
                  <div className="h-7 w-16 rounded-md bg-white/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
