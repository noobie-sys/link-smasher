"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
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
  const { data: session } = useSession();
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
    <div className="flex flex-1 flex-col pb-12 font-sans bg-background">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 transition-[width,height] ease-linear px-4 lg:px-6">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="mx-2 h-4 bg-border/50" />
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold text-foreground tracking-tight">Analytics Dashboard</h1>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 space-y-6 p-4 md:p-6 max-w-6xl w-full mx-auto animate-in fade-in duration-500">
        {/* Section Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Vault Insights</h2>
          <p className="text-xs text-muted-foreground">
            Monitor link saving growth, browsing activity logs, and system sync statistics.
          </p>
        </div>

        {/* Dynamic Cards */}
        <SectionCards
          totalLinks={summary?.totalLinks ?? 0}
          savedThisWeek={summary?.savedThisWeek ?? 0}
          weekOverWeekDelta={summary?.weekOverWeekDelta ?? null}
          topSite={summary?.topSitesByTime?.[0] ?? null}
        />

        {/* Dynamic Area Chart */}
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive data={history} />
        </div>
      </main>
    </div>
  );
}
