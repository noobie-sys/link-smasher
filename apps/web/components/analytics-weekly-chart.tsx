"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface WeeklyBarChartProps {
  savedThisWeek: number;
  savedLastWeek: number;
  weekOverWeekDelta: number | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string; fill: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="rounded-lg border border-border/60 px-3 py-2 text-xs shadow-lg"
      style={{
        background: "var(--chart-tooltip-background)",
        color: "var(--chart-tooltip-foreground)",
      }}
    >
      <p className="font-semibold mb-0.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.value} link{p.value !== 1 ? "s" : ""}
        </p>
      ))}
    </div>
  );
}

export function WeeklyBarChart({
  savedThisWeek,
  savedLastWeek,
  weekOverWeekDelta,
}: WeeklyBarChartProps) {
  const data = [
    {
      week: "Last week",
      saves: savedLastWeek,
      fill: "var(--muted-foreground)",
    },
    {
      week: "This week",
      saves: savedThisWeek,
      fill: "var(--primary)",
    },
  ];

  const isUp = weekOverWeekDelta !== null && weekOverWeekDelta > 0;
  const isDown = weekOverWeekDelta !== null && weekOverWeekDelta < 0;
  const isFlat = weekOverWeekDelta === 0;

  return (
    <Card className="@container/card border-border/60 bg-card/65 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-foreground text-base">
          Week-over-Week
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Comparing current week saves to last week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          {isUp && (
            <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-500 border border-green-500/20">
              <TrendingUp className="h-3 w-3" />
              +{weekOverWeekDelta}% from last week
            </div>
          )}
          {isDown && (
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-500 border border-red-500/20">
              <TrendingDown className="h-3 w-3" />
              {weekOverWeekDelta}% from last week
            </div>
          )}
          {isFlat && (
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/60">
              <Minus className="h-3 w-3" />
              Same as last week
            </div>
          )}
          {weekOverWeekDelta === null && (
            <div className="text-xs text-muted-foreground">
              No previous week to compare
            </div>
          )}
        </div>

        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 4, left: -20 }}
            barSize={40}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4, radius: 4 }}
              content={<CustomTooltip />}
            />
            <Bar dataKey="saves" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.week} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
