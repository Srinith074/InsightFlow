import type { DatasetItem } from "@/types"

export const datasetItems: DatasetItem[] = [
  { id: "ds-01", name: "Sales Signals", records: "1.4M", type: "Behavioral", status: "Live", updated: "1h ago" },
  { id: "ds-02", name: "Market Pulse", records: "760k", type: "Time Series", status: "Reviewing", updated: "4h ago" },
  { id: "ds-03", name: "Customer Funnel", records: "430k", type: "Transactional", status: "Live", updated: "Yesterday" },
  { id: "ds-04", name: "Campaign Metrics", records: "98k", type: "Event", status: "Paused", updated: "2 days ago" },
]
