import { SectionHeader } from "@/components/common/SectionHeader"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
import { reportRows } from "@/services/reports"
import { Badge, Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui"

export function ReportsPage() {
  return (
    <div className="grid gap-6">
      <SectionHeader title="Reports" description="Review and export the latest reports generated from your datasets." />
      <Card className="border border-border bg-card/90 shadow-sm">
        <CardHeader className="space-y-2 p-6">
          <CardTitle>Recent reports</CardTitle>
          <CardDescription>All reports are stored centrally and ready for team review.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.owner}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "Live" ? "secondary" : row.status === "Completed" ? "default" : "outline"}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.updated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
