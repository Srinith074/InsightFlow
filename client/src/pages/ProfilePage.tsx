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
  Input,
} from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfileStats, changeUserPassword, type ProfileStats } from "@/services/auth";
import {
  Bookmark,
  Calendar,
  Database,
  FileText,
  KeyRound,
  Layers,
  LogOut,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function ProfilePage() {
  useDocumentTitle("InsightFlow — Profile");
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoadingStats(true);
        const data = await fetchProfileStats();
        setStats(data.stats);
      } catch (err) {
        console.error("Failed to load profile statistics:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    loadStats();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: "" });

    if (!currentPassword || !newPassword) {
      setPasswordStatus({ type: "error", message: "Please fill in all password fields." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match." });
      return;
    }

    try {
      setChangingPassword(true);
      const res = await changeUserPassword(currentPassword, newPassword);
      setPasswordStatus({ type: "success", message: res.message || "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message || "Failed to update password. Check current password.";
      setPasswordStatus({ type: "error", message: msg });
    } finally {
      setChangingPassword(false);
    }
  };

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
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground font-semibold">
                  User Account
                </p>
                <Badge variant="default" className="text-[10px] bg-emerald-600 hover:bg-emerald-600">
                  100% Free Full Access
                </Badge>
              </div>
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

      {/* Real Workspace Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Indexed Datasets
            </p>
            <Database className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {loadingStats ? "..." : stats?.datasetsCount ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Active workbooks</p>
        </Card>

        <Card className="border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Records Managed
            </p>
            <Layers className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {loadingStats ? "..." : (stats?.totalRowsManaged ?? 0).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Rows across spreadsheets</p>
        </Card>

        <Card className="border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Saved Insights
            </p>
            <Bookmark className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {loadingStats ? "..." : stats?.savedInsightsCount ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Curated discoveries</p>
        </Card>

        <Card className="border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Generated Reports
            </p>
            <FileText className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {loadingStats ? "..." : stats?.reportsCount ?? 0}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Strategic exports</p>
        </Card>
      </div>

      {/* Account Details & Security */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Details */}
        <Card className="border border-border bg-card/90 shadow-sm">
          <CardHeader className="space-y-1 p-6">
            <div className="flex items-center gap-2 text-primary">
              <UserIcon className="size-5" />
              <CardTitle className="text-base font-semibold">Account Identity</CardTitle>
            </div>
            <CardDescription>Your authenticated account credentials and security status</CardDescription>
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
            <div className="rounded-2xl border border-border bg-muted/40 p-3 space-y-1">
              <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" />
                Session Security
              </p>
              <p className="text-[11px] text-muted-foreground">
                HTTP-only secure cookie session active. Zero sensitive tokens exposed to local storage.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Form */}
        <Card className="border border-border bg-card/90 shadow-sm">
          <CardHeader className="space-y-1 p-6">
            <div className="flex items-center gap-2 text-primary">
              <KeyRound className="size-5" />
              <CardTitle className="text-base font-semibold">Update Password</CardTitle>
            </div>
            <CardDescription>Securely update your account login credentials</CardDescription>
          </CardHeader>
          <CardContent className="border-t border-border p-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordStatus.message && (
                <div
                  className={`rounded-xl p-3 text-xs ${
                    passwordStatus.type === "success"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}
                >
                  {passwordStatus.message}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Current Password</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={changingPassword}
                className="w-full text-xs inline-flex items-center justify-center gap-1.5"
              >
                {changingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
