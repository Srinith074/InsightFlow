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

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex cursor-pointer items-center gap-2 rounded-3xl px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors outline-none select-none"
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

        <span className="hidden sm:inline font-medium">
          {user?.name ?? "Account"}
        </span>

        <ChevronDown className="size-4 opacity-70" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 space-y-2 p-2 shadow-lg"
      >
        <div className="rounded-2xl border border-border bg-muted/60 p-3">
          <p className="text-xs text-muted-foreground">
            Signed in as
          </p>

          <p className="font-semibold text-sm text-foreground truncate">
            {user?.name ?? "Member"}
          </p>

          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleProfileClick}
          onSelect={handleProfileClick}
          className="flex cursor-pointer items-center gap-2"
        >
          <UserIcon className="size-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogoutClick}
          onSelect={handleLogoutClick}
          className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}