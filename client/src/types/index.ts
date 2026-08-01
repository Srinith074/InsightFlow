export interface DashboardMetric {
  label: string
  value: string
  change: string
  trend: "up" | "down"
  subtitle: string
}

export interface ChartPoint {
  name: string
  revenue: number
  growth: number
}

export interface ReportRow {
  id: string
  title: string
  owner: string
  status: "Pending" | "Live" | "Completed"
  updated: string
}

export interface DatasetItem {
  id: string
  name: string
  records: string
  type: string
  status: "Live" | "Reviewing" | "Paused"
  updated: string
}

export interface ChatMessage {
  id: string
  sender: "ai" | "user"
  message: string
  timestamp: string
}

export interface UserProfile {
  name: string
  role: string
  email: string
  plan: string
  joined: string
}
