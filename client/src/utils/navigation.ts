import {
  type LucideIcon,
  BarChart3,
  Bookmark,
  FileText,
  FolderTree,
  LayoutDashboard,
  Sparkles,
  UploadCloud,
  User,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const workspaceNavigation: NavigationItem[] = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
  { label: "AI Analyst", path: "/dashboard/ai-chat", icon: Sparkles },
  { label: "Saved Insights", path: "/dashboard/insights", icon: Bookmark },
  { label: "Reports", path: "/dashboard/reports", icon: FileText },
  { label: "Datasets", path: "/dashboard/datasets", icon: FolderTree },
];

export const managementNavigation: NavigationItem[] = [
  { label: "Upload", path: "/dashboard/upload", icon: UploadCloud },
  { label: "Profile", path: "/dashboard/profile", icon: User },
]

export const dashboardNavigation: NavigationItem[] = [
  ...workspaceNavigation,
  ...managementNavigation,
]
