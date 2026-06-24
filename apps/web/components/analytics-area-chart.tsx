"use client";

import * as React from "react";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

const SAVES_COLOR = "var(--primary)";
const MINUTES_COLOR = "#D946EF";

interface DailyHistoryRow {
  date: string;
  saves: number;
  activeMinutes: number;
}

interface ChartRow extends Record<string, unknown> {
  date: Date;
  saves: number;
  activeMinutes: number;
}

interface AnalyticsAreaChartProps {
  data: DailyHistoryRow[];
}

export function AnalyticsAreaChart({ data }: AnalyticsAreaChartProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  const chartData: ChartRow[] = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    const range = timeRange === "7d" ? 7 : 30;
    return data.slice(-range).map((row) => ({
      date: new Date(row.date + "T12:00:00Z"),
      saves: row.saves,
      activeMinutes: row.activeMinutes,
    }));
  }, [data, timeRange]);

  const totals = React.useMemo(() => {
    return chartData.reduce(
      (acc, item) => ({
        saves: acc.saves + item.saves,
        minutes: acc.minutes + item.activeMinutes,
      }),
      { saves: 0, minutes: 0 }
    );
  }, [chartData]);

  return (
    <Card className="@container/card border-border/60 bg-card/65 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-foreground text-base">
          Link Saves &amp; Browsing Activity
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          {totals.saves} links saved · {totals.minutes} minutes of active browsing
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
              <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-4 pb-4">
        {chartData.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
            No activity data yet
          </div>
        ) : (
          <>
            {/* Legend */}
            <div className="flex items-center gap-4 mb-3 px-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: SAVES_COLOR }}
                />
                Saved Links
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: MINUTES_COLOR }}
                />
                Active Minutes
              </div>
            </div>

            <div style={{ height: 220 }}>
              <AreaChart
                data={chartData}
                xDataKey="date"
                aspectRatio="unset"
                style={{ height: "100%" }}
                margin={{ top: 16, right: 24, bottom: 36, left: 24 }}
              >
                <Grid
                  horizontal
                  numTicksRows={4}
                  strokeDasharray="4,4"
                  fadeHorizontal
                />
                <XAxis numTicks={isMobile ? 4 : 5} />
                <Area
                  dataKey="saves"
                  fill={SAVES_COLOR}
                  stroke={SAVES_COLOR}
                  fillOpacity={0.35}
                  strokeWidth={2}
                  gradientToOpacity={0}
                />
                <Area
                  dataKey="activeMinutes"
                  fill={MINUTES_COLOR}
                  stroke={MINUTES_COLOR}
                  fillOpacity={0.25}
                  strokeWidth={2}
                  gradientToOpacity={0}
                />
                <ChartTooltip
                  rows={(point) => [
                    {
                      color: SAVES_COLOR,
                      label: "Links saved",
                      value: point.saves as number,
                    },
                    {
                      color: MINUTES_COLOR,
                      label: "Active min",
                      value: point.activeMinutes as number,
                    },
                  ]}
                />
              </AreaChart>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
