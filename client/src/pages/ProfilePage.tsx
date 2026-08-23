import { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { fetchDatasets } from "@/services/datasets";
import {
  Calendar,
  Database,
  LogOut,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [datasetCount, setDatasetCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const datasets = await fetchDatasets();
        setDatasetCount(datasets.length);
      } catch (err) {
        console.error("Failed to load profile dataset stats:", err);
      }
    }

    loadStats();
  }, []);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="grid gap-6">
      {/* Profile Header */}
      <div className="grid gap-4 rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              {user?.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user?.name?.charAt(0) ?? "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground font-semibold">
                User Profile
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {user?.name ?? "User"}
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={logout}
            className="inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Account Details & Workspace Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-border bg-card/90 shadow-sm">
          <CardHeader className="space-y-1 p-6">
            <div className="flex items-center gap-2 text-primary">
              <UserIcon className="size-5" />
              <CardTitle className="text-base font-semibold">Account Details</CardTitle>
            </div>
            <CardDescription>Your authenticated account credentials and timestamps</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 border-t border-border p-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Full Name</p>
              <p className="text-sm font-semibold text-foreground">{user?.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Email Address</p>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Member Since</p>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{memberSince}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/90 shadow-sm">
          <CardHeader className="space-y-1 p-6">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="size-5" />
              <CardTitle className="text-base font-semibold">Workspace Security & Data</CardTitle>
            </div>
            <CardDescription>Connected data assets and session status</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 border-t border-border p-6">
            <div className="rounded-2xl bg-muted/60 p-4">
              <p className="text-xs font-medium text-muted-foreground">Indexed Datasets</p>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="size-4 text-primary" />
                  <p className="text-lg font-bold text-foreground">
                    {datasetCount !== null ? `${datasetCount} active` : "Loading..."}
                  </p>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
            </div>

            <div className="rounded-2xl bg-muted/60 p-4">
              <p className="text-xs font-medium text-muted-foreground">Session Security</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Secure HTTP-only Session</p>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
