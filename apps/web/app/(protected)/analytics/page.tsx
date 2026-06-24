"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SectionCards } from "@/components/section-cards";
import { AnalyticsAreaChart } from "@/components/analytics-area-chart";
import { AnalyticsTopSitesChart } from "@/components/analytics-top-sites";
import { WeeklyBarChart } from "@/components/analytics-weekly-chart";
import { BarChart3, Loader2 } from "lucide-react";

interface AnalyticsSummary {
  totalLinks: number;
  savedThisWeek: number;
  savedLastWeek: number;
  weekOverWeekDelta: number | null;
  topSitesByTime: { hostname: string; totalMs: number }[];
}

interface DailyHistoryRow {
  date: string;
  saves: number;
  activeMinutes: number;
}

export default function AnalyticsPage() {
  useSession();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [history, setHistory] = useState<DailyHistoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [summaryRes, historyRes] = await Promise.all([
          fetch("/api/analytics/summary"),
          fetch("/api/analytics/history"),
        ]);
        const summaryJson = await summaryRes.json();
        const historyJson = await historyRes.json();

        if (summaryJson.success) setSummary(summaryJson.data);
        if (historyJson.success) setHistory(historyJson.data);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden font-sans bg-background text-foreground relative">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 transition-[width,height] ease-linear px-4 lg:px-6 bg-background/50 backdrop-blur-xs relative z-20">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="mx-2 h-4 bg-border/50" />
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold text-foreground tracking-tight">Analytics Dashboard</h1>
        </div>
      </header>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto pb-12 relative z-10">
        <main className="space-y-6 p-4 md:p-6 max-w-6xl w-full mx-auto animate-in fade-in duration-500">

          {/* Section Title */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Vault Insights</h2>
            <p className="text-xs text-muted-foreground">
              Monitor link saving growth, browsing activity, and research time across all your tracked sites.
            </p>
          </div>

          {/* Summary Stat Cards */}
          <SectionCards
            totalLinks={summary?.totalLinks ?? 0}
            savedThisWeek={summary?.savedThisWeek ?? 0}
            weekOverWeekDelta={summary?.weekOverWeekDelta ?? null}
            topSite={summary?.topSitesByTime?.[0] ?? null}
          />

          {/* Area Chart — full width */}
          <div className="px-4 lg:px-6">
            <AnalyticsAreaChart data={history} />
          </div>

          {/* Two-column row: Top Sites pie + Week-over-week bar */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-2">
            <AnalyticsTopSitesChart sites={summary?.topSitesByTime ?? []} />
            <WeeklyBarChart
              savedThisWeek={summary?.savedThisWeek ?? 0}
              savedLastWeek={summary?.savedLastWeek ?? 0}
              weekOverWeekDelta={summary?.weekOverWeekDelta ?? null}
            />
          </div>

          {/* All-Time Stats row */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-3">
            {/* Peak day */}
            <div className="rounded-xl border border-border/60 bg-card/65 backdrop-blur-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Peak Save Day (30d)</p>
              {(() => {
                const peak = history.reduce(
                  (best, row) => (row.saves > best.saves ? row : best),
                  { date: "", saves: 0, activeMinutes: 0 }
                );
                return (
                  <>
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {peak.saves}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {peak.date
                        ? new Date(peak.date + "T12:00:00Z").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Total active time (30d) */}
            <div className="rounded-xl border border-border/60 bg-card/65 backdrop-blur-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Browse Time (30d)</p>
              {(() => {
                const totalMin = history.reduce((sum, r) => sum + r.activeMinutes, 0);
                const hours = Math.floor(totalMin / 60);
                const mins = totalMin % 60;
                return (
                  <>
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalMin} minutes logged
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Daily average saves (30d) */}
            <div className="rounded-xl border border-border/60 bg-card/65 backdrop-blur-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Avg. Daily Saves (30d)</p>
              {(() => {
                const total = history.reduce((sum, r) => sum + r.saves, 0);
                const avg = history.length > 0 ? (total / history.length).toFixed(1) : "0";
                return (
                  <>
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                      {avg}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      links per day on average
                    </p>
                  </>
                );
              })()}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
