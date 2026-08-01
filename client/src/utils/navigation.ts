import { type LucideIcon, BarChart3, FileText, FolderTree, Home, MessageCircle, Settings, UploadCloud, User } from "lucide-react"

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

export const dashboardNavigation: NavigationItem[] = [
  { label: "Home", path: "/dashboard", icon: Home },
  { label: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
  { label: "AI Chat", path: "/dashboard/ai-chat", icon: MessageCircle },
  { label: "Reports", path: "/dashboard/reports", icon: FileText },
  { label: "Datasets", path: "/dashboard/datasets", icon: FolderTree },
  { label: "Upload", path: "/dashboard/upload", icon: UploadCloud },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
  { label: "Profile", path: "/dashboard/profile", icon: User },
]
