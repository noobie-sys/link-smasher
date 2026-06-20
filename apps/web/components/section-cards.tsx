"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUp, TrendingDown, Link2, Globe, Activity, Clock } from "lucide-react"
import { formatDurationMs } from "@/lib/analytics-utils"

interface SectionCardsProps {
  totalLinks: number
  savedThisWeek: number
  weekOverWeekDelta: number | null
  topSite: { hostname: string; totalMs: number } | null
}

export function SectionCards({
  totalLinks,
  savedThisWeek,
  weekOverWeekDelta,
  topSite,
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card/45">
      
      {/* Card 1: Total Links */}
      <Card className="@container/card border-border/60 bg-card/65 backdrop-blur-xl">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link2 className="h-3.5 w-3.5 text-primary" />
            Total Saved Links
          </CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-foreground pt-1">
            {totalLinks}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div>All links stored in your vault</div>
        </CardFooter>
      </Card>

      {/* Card 2: Saved This Week */}
      <Card className="@container/card border-border/60 bg-card/65 backdrop-blur-xl">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            Saves This Week
          </CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums text-foreground pt-1">
            {savedThisWeek}
          </CardTitle>
          {weekOverWeekDelta !== null && (
            <CardAction>
              <Badge variant="outline" className={weekOverWeekDelta >= 0 ? "text-green-400 border-green-500/25 bg-green-500/5 gap-1" : "text-red-400 border-red-500/25 bg-red-500/5 gap-1"}>
                {weekOverWeekDelta >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3" />
                    +{weekOverWeekDelta}%
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3" />
                    {weekOverWeekDelta}%
                  </>
                )}
              </Badge>
            </CardAction>
          )}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div>
            {weekOverWeekDelta !== null 
              ? `${weekOverWeekDelta >= 0 ? "Increased" : "Decreased"} compared to last week`
              : "No previous week data to compare"}
          </div>
        </CardFooter>
      </Card>

      {/* Card 3: Top Site */}
      <Card className="@container/card border-border/60 bg-card/65 backdrop-blur-xl">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5 text-teal-400" />
            Top Site (Active Time)
          </CardDescription>
          <CardTitle className="text-lg font-bold text-foreground truncate pt-1 max-w-[200px]">
            {topSite?.hostname || "—"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div>
            {topSite 
              ? `Logged ${formatDurationMs(topSite.totalMs)} of research`
              : "No browsing logs uploaded yet"}
          </div>
        </CardFooter>
      </Card>

      {/* Card 4: Sync Connection */}
      <Card className="@container/card border-border/60 bg-card/65 backdrop-blur-xl">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            Sync Status
          </CardDescription>
          <CardTitle className="text-2xl font-bold text-foreground pt-1 flex items-center gap-2">
            Active
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div>Vault is connected and syncing in real-time</div>
        </CardFooter>
      </Card>

    </div>
  )
}
