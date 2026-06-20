"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

const chartConfig = {
  saves: {
    label: "Saved Links",
    color: "#2763FF", // lk-primary
  },
  activeMinutes: {
    label: "Active Research (min)",
    color: "#D946EF", // brand-magenta
  },
} satisfies ChartConfig

interface ChartAreaInteractiveProps {
  data: { date: string; saves: number; activeMinutes: number }[]
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Filter the data based on selection (past 30 days or past 7 days)
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    const range = timeRange === "7d" ? 7 : 30
    return data.slice(-range)
  }, [data, timeRange])

  // Calculate totals for description
  const totals = React.useMemo(() => {
    return filteredData.reduce(
      (acc, item) => ({
        saves: acc.saves + item.saves,
        minutes: acc.minutes + item.activeMinutes,
      }),
      { saves: 0, minutes: 0 }
    )
  }, [filteredData])

  return (
    <Card className="@container/card border-border/60 bg-card/65 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-foreground text-base">User Activity & Research Logs</CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Showing {totals.saves} saved links and {totals.minutes} minutes of active browsing.
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
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillSaves" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#2763FF"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#2763FF"
                  stopOpacity={0.01}
                />
              </linearGradient>
              <linearGradient id="fillMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#D946EF"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="#D946EF"
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" opacity={0.6} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
              stroke="var(--muted-foreground)"
              opacity={0.7}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="activeMinutes"
              type="natural"
              fill="url(#fillMinutes)"
              stroke="#D946EF"
              stackId="a"
              name="activeMinutes"
            />
            <Area
              dataKey="saves"
              type="natural"
              fill="url(#fillSaves)"
              stroke="#2763FF"
              stackId="a"
              name="saves"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
