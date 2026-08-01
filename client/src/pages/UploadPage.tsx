import { SectionHeader } from "@/components/common/SectionHeader"
import { FileUploadPanel } from "@/components/upload/FileUploadPanel"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui"

export function UploadPage() {
  return (
    <div className="grid gap-6">
      <SectionHeader title="Upload" description="Add new datasets and connect them to your analytics workflows." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <FileUploadPanel />
        <Card className="border border-border bg-card/90 shadow-sm">
          <CardHeader className="space-y-2 p-6">
            <CardTitle>Upload guidance</CardTitle>
            <CardDescription>We support structured and unstructured inputs for rapid enrichment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 border-t border-border p-6">
            <div>
              <p className="text-sm font-semibold text-foreground">Best formats</p>
              <p className="text-sm text-muted-foreground">CSV, JSON, XLSX, Markdown, text.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Review files</p>
              <p className="text-sm text-muted-foreground">Files are indexed and validated before they appear in analytics.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Team access</p>
              <p className="text-sm text-muted-foreground">Set permissions across datasets with collaboration controls.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
