import { Card, CardContent, CardHeader, CardDescription, CardTitle, Button } from "@/components/ui"
import { useState } from "react"

export function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [dataSync, setDataSync] = useState(true)

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Settings</p>
            <h1 className="text-3xl font-semibold text-foreground">Workspace controls</h1>
          </div>
          <Button variant="secondary">Save changes</Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-border bg-card/90 shadow-sm">
          <CardHeader className="space-y-3 p-6">
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose alerts for data updates and report events.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 border-t border-border p-6">
            <label className="flex items-center justify-between gap-3 rounded-3xl bg-muted p-4">
              <span>
                <p className="font-medium text-foreground">Email notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates when new datasets are available.</p>
              </span>
              <input type="checkbox" checked={emailAlerts} onChange={() => setEmailAlerts((value) => !value)} className="h-5 w-5 rounded border-border bg-background text-primary" />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-3xl bg-muted p-4">
              <span>
                <p className="font-medium text-foreground">Sync alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when ingestion pipelines update.</p>
              </span>
              <input type="checkbox" checked={dataSync} onChange={() => setDataSync((value) => !value)} className="h-5 w-5 rounded border-border bg-background text-primary" />
            </label>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card/90 shadow-sm">
          <CardHeader className="space-y-3 p-6">
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Manage your team environment and shared tools.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 border-t border-border p-6">
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Team access</p>
              <p className="mt-2 font-medium text-foreground">Manage collaborators and data permissions.</p>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Data retention</p>
              <p className="mt-2 font-medium text-foreground">Retain analytics history for 12 months.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
