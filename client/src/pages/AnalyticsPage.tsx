import { SectionHeader } from "@/components/common/SectionHeader"
import { RevenueTrend } from "@/components/charts/RevenueTrend"
import { revenueData } from "@/services/dashboard"
import { Card, CardContent, CardHeader, CardDescription, CardTitle, Badge } from "@/components/ui"

export function AnalyticsPage() {
  return (
    <div className="grid gap-6">
      <SectionHeader title="Analytics" description="Deep performance insights across channels, campaigns, and AI engagement." />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <RevenueTrend data={revenueData} />
        <Card className="border border-border bg-card/90 p-5 shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-lg">Performance score</CardTitle>
            <CardDescription>Track conversion velocity and intelligence adoption with every dataset.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
            <div className="space-y-4">
              {[
                { label: "Conversion lift", value: "+22.7%" },
                { label: "AI adoption", value: "86.2%" },
                { label: "Pipeline growth", value: "+14.9%" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-muted p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border border-border bg-card/90 p-6 shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-lg">Insights delivered</CardTitle>
          <CardDescription>Leverage the latest insights for product, growth, and executive reports.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Weekly active users</p>
              <p className="text-2xl font-semibold text-foreground">28.4k</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Dataset refreshes</p>
              <p className="text-2xl font-semibold text-foreground">63</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Forecast accuracy</p>
              <p className="text-2xl font-semibold text-foreground">94.7%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
