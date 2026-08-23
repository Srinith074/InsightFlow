import { api } from "@/utils/api";

export interface InsightEvidence {
  metric?: string;
  current?: string | number;
  previous?: string | number;
  delta?: string | number;
  details?: string;
}

export interface SavedInsight {
  id: string;
  datasetId: string;
  datasetName: string;
  sheetName: string;
  title: string;
  content: string;
  evidence?: InsightEvidence;
  category: "revenue" | "growth" | "product" | "quality" | "volume" | "general";
  createdAt: string;
  updatedAt: string;
}

export async function fetchInsights(datasetId?: string): Promise<SavedInsight[]> {
  const url = datasetId ? `/api/insights?datasetId=${encodeURIComponent(datasetId)}` : "/api/insights";
  const response = await api.get<{ insights: SavedInsight[] }>(url);
  return response.data.insights;
}

export async function fetchInsightById(id: string): Promise<SavedInsight> {
  const response = await api.get<{ insight: SavedInsight }>(`/api/insights/${id}`);
  return response.data.insight;
}

export async function createSavedInsight(data: {
  datasetId: string;
  datasetName?: string;
  sheetName?: string;
  title: string;
  content: string;
  evidence?: InsightEvidence;
  category?: string;
}): Promise<SavedInsight> {
  const response = await api.post<{ success: boolean; insight: SavedInsight }>("/api/insights", data);
  return response.data.insight;
}

export async function updateSavedInsight(
  id: string,
  data: { title?: string; content?: string; category?: string }
): Promise<SavedInsight> {
  const response = await api.patch<{ success: boolean; insight: SavedInsight }>(`/api/insights/${id}`, data);
  return response.data.insight;
}

export async function deleteSavedInsight(id: string): Promise<void> {
  await api.delete(`/api/insights/${id}`);
}
