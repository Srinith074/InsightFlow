import { SectionHeader } from "@/components/common/SectionHeader"
import { Card, CardContent, CardHeader, CardDescription, CardTitle, Badge } from "@/components/ui"
import { datasetItems } from "@/services/files"

export function DatasetsPage() {
  return (
    <div className="grid gap-6">
      <SectionHeader title="Datasets" description="Manage dataset sources, refresh schedules, and ingestion status." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {datasetItems.map((dataset) => (
          <Card key={dataset.id} className="border border-border bg-card/90 shadow-sm">
            <CardHeader className="space-y-2 p-5">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg">{dataset.name}</CardTitle>
                <Badge variant={dataset.status === "Live" ? "secondary" : dataset.status === "Paused" ? "destructive" : "outline"}>{dataset.status}</Badge>
              </div>
              <CardDescription>{dataset.type} dataset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 border-t border-border p-5">
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-4">
                  <span>Records</span>
                  <span className="text-foreground">{dataset.records}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Last update</span>
                  <span className="text-foreground">{dataset.updated}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
