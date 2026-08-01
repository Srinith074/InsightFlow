import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui"
import { User } from "lucide-react"

export function ProfilePage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80" alt="Profile image" />
              <AvatarFallback>AO</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Profile</p>
              <h1 className="text-3xl font-semibold text-foreground">Alex Oakley</h1>
              <p className="text-sm text-muted-foreground">Growth lead, InsightFlow</p>
            </div>
          </div>
          <Button variant="secondary">Edit profile</Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-border bg-card/90 shadow-sm">
          <CardHeader className="space-y-2 p-6">
            <CardTitle>Account details</CardTitle>
            <CardDescription>Manage your profile and access settings.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 border-t border-border p-6">
            {[
              { label: "Email", value: "alex.oakley@insightflow.com" },
              { label: "Role", value: "Product Growth Lead" },
              { label: "Plan", value: "Enterprise" },
              { label: "Member since", value: "Jan 2024" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-base font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border border-border bg-card/90 shadow-sm">
          <CardHeader className="space-y-2 p-6">
            <div className="flex items-center gap-2 text-primary">
              <User className="size-5" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Protect your account and secure collaborative access.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 border-t border-border p-6">
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Two-factor authentication</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">Enabled</p>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Active sessions</p>
              <p className="mt-2 font-medium text-foreground">3 devices connected</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
