import { SectionHeader } from "@/components/common/SectionHeader"
import { OverviewCards } from "@/components/dashboard/OverviewCards"
import { RevenueTrend } from "@/components/charts/RevenueTrend"
import { Button, Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui"
import { revenueData } from "@/services/dashboard"
import { BarChart3 } from "lucide-react"

export function DashboardHome() {
  return (
    <div className="grid gap-6">
      <SectionHeader title="Home" description="Your analytics workspace for every dataset, insight, and AI conversation." />
      <OverviewCards />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <RevenueTrend data={revenueData} />
        <Card className="border border-border bg-card/90 p-5 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <BarChart3 className="size-5" />
              <CardTitle className="text-lg">Quarterly summary</CardTitle>
            </div>
            <CardDescription>Plan campaigns, track conversions, and collaborate with stakeholders in one place.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Estimated pipeline</p>
              <p className="text-2xl font-semibold text-foreground">$1.08M</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Retention score</p>
              <p className="text-2xl font-semibold text-foreground">91.4%</p>
            </div>
            <Button className="w-full">Review latest insight</Button>
          </CardContent>
        </Card>
      </div>
      <Card className="border border-border bg-card/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Highlights</p>
            <h3 className="text-xl font-semibold text-foreground">Weekly growth and AI adoption</h3>
          </div>
          <Button variant="secondary">Export snapshot</Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Insights created", value: "36" },
            { label: "Active collaborators", value: "12" },
            { label: "Avg response time", value: "4 min" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
