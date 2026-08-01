import type { ChartPoint, DashboardMetric } from "@/types"

export const overviewMetrics: DashboardMetric[] = [
  {
    label: "Revenue",
    value: "$124.8k",
    change: "+18.2%",
    trend: "up",
    subtitle: "Last 30 days",
  },
  {
    label: "Active datasets",
    value: "82",
    change: "+5.4%",
    trend: "up",
    subtitle: "Validated sources",
  },
  {
    label: "Customer retention",
    value: "91.4%",
    change: "+3.8%",
    trend: "up",
    subtitle: "Quarterly average",
  },
  {
    label: "AI engagements",
    value: "14.2k",
    change: "+24.1%",
    trend: "up",
    subtitle: "Interactions this month",
  },
]

export const revenueData: ChartPoint[] = [
  { name: "Jan", revenue: 42, growth: 16 },
  { name: "Feb", revenue: 55, growth: 22 },
  { name: "Mar", revenue: 67, growth: 28 },
  { name: "Apr", revenue: 80, growth: 34 },
  { name: "May", revenue: 94, growth: 38 },
  { name: "Jun", revenue: 110, growth: 43 },
  { name: "Jul", revenue: 125, growth: 49 },
]
