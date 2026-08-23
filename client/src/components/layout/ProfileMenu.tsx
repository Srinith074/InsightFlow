import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  User as UserIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";

import { useAuth } from "@/hooks/useAuth";

export function ProfileMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-2 rounded-3xl px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
      >
        <Avatar size="sm">
          {user?.avatar ? (
            <AvatarImage
              src={user.avatar}
              alt={user.name}
            />
          ) : (
            <AvatarFallback>
              {user?.name?.charAt(0) ?? "U"}
            </AvatarFallback>
          )}
        </Avatar>

        <span className="hidden sm:inline">
          {user?.name ?? "Account"}
        </span>

        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 space-y-2 p-2"
      >
        <div className="rounded-3xl border border-border bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            Signed in as
          </p>

          <p className="font-semibold text-foreground">
            {user?.name ?? "Member"}
          </p>

          <p className="text-sm text-muted-foreground">
            {user?.email}
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => navigate("/dashboard/profile")}
          className="flex items-center gap-2"
        >
          <UserIcon className="size-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={logout}
          className="flex items-center gap-2 text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}