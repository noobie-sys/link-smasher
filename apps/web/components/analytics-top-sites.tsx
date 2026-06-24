"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDurationMs } from "@/lib/analytics-utils";
import { Globe } from "lucide-react";

interface TopSite {
  hostname: string;
  totalMs: number;
}

interface AnalyticsTopSitesChartProps {
  sites: TopSite[];
}

const SITE_COLORS = [
  "var(--primary)",
  "#D946EF",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
];

// Custom label inside donut
function DonutLabel({
  totalMs,
  siteCount,
}: {
  totalMs: number;
  siteCount: number;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <p className="text-2xl font-bold tabular-nums text-foreground">
        {formatDurationMs(totalMs)}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        across {siteCount} site{siteCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; payload: { hostname: string; totalMs: number; fill: string } }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  return (
    <div
      className="rounded-lg border border-border/60 px-3 py-2 text-xs shadow-lg"
      style={{ background: "var(--chart-tooltip-background)", color: "var(--chart-tooltip-foreground)" }}
    >
      <p className="font-semibold mb-0.5">{item.hostname}</p>
      <p style={{ color: item.fill }}>{formatDurationMs(item.totalMs)}</p>
    </div>
  );
}

export function AnalyticsTopSitesChart({ sites }: AnalyticsTopSitesChartProps) {
  const totalMs = React.useMemo(
    () => sites.reduce((sum, s) => sum + s.totalMs, 0),
    [sites]
  );

  const pieData = React.useMemo(
    () =>
      sites.map((site, i) => ({
        hostname: site.hostname,
        totalMs: site.totalMs,
        name: site.hostname,
        value: site.totalMs,
        fill: SITE_COLORS[i % SITE_COLORS.length],
      })),
    [sites]
  );

  if (sites.length === 0) {
    return (
      <Card className="@container/card border-border/60 bg-card/65 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Top Sites by Time
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Browsing time breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
            No browsing data yet — install the extension to start tracking
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card border-border/60 bg-card/65 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-foreground text-base flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          Top Sites by Time
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Total logged: {formatDurationMs(totalMs)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col @[400px]/card:flex-row items-center gap-6">
          {/* Donut chart */}
          <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={82}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.hostname}
                      fill={entry.fill}
                      opacity={0.9}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <DonutLabel totalMs={totalMs} siteCount={sites.length} />
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 min-w-0 w-full">
            {pieData.map((entry, i) => {
              const pct = totalMs > 0 ? Math.round((entry.totalMs / totalMs) * 100) : 0;
              return (
                <div key={entry.hostname} className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: SITE_COLORS[i % SITE_COLORS.length] }}
                  />
                  <span className="text-xs text-foreground truncate flex-1 min-w-0">
                    {entry.hostname}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {formatDurationMs(entry.totalMs)}
                  </span>
                  <span
                    className="text-xs font-medium tabular-nums shrink-0"
                    style={{ color: SITE_COLORS[i % SITE_COLORS.length] }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
