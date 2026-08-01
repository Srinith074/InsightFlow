import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import type { DashboardMetric } from "@/types"

interface StatsCardProps {
  metric: DashboardMetric
}

export function StatsCard({ metric }: StatsCardProps) {
  const isPositive = metric.trend === "up"

  return (
    <Card className="border border-border bg-card/90 shadow-sm">
      <CardHeader className="space-y-2 px-4 pt-4">
        <CardTitle className="text-sm font-semibold text-foreground">{metric.label}</CardTitle>
        <CardDescription>{metric.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-3xl font-semibold text-foreground">{metric.value}</p>
            <p className="text-sm text-muted-foreground">{metric.change} vs. prior period</p>
          </div>
          <Badge variant={isPositive ? "secondary" : "destructive"} className="inline-flex items-center gap-1 px-3 py-2">
            {isPositive ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
            {metric.trend === "up" ? "Growth" : "Decline"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
