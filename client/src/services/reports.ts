import { api } from "@/utils/api";

export interface ReportKPI {
  label: string;
  value: string;
  subtitle?: string;
}

export interface ReportPerformer {
  name: string;
  value: string;
  share?: string;
}

export interface ReportDataQuality {
  totalRows: number;
  qualityScore: number;
  warnings: string[];
}

export interface SavedReport {
  id: string;
  datasetId: string;
  datasetName: string;
  sheetName: string;
  title: string;
  summary: string;
  kpis: ReportKPI[];
  insights: string[];
  topPerformers: ReportPerformer[];
  dataQualitySummary: ReportDataQuality;
  markdownContent?: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchReports(datasetId?: string): Promise<SavedReport[]> {
  const url = datasetId ? `/api/reports?datasetId=${encodeURIComponent(datasetId)}` : "/api/reports";
  const response = await api.get<{ reports: SavedReport[] }>(url);
  return response.data.reports;
}

export async function fetchReportById(id: string): Promise<SavedReport> {
  const response = await api.get<{ report: SavedReport }>(`/api/reports/${id}`);
  return response.data.report;
}

export async function createReport(data: {
  datasetId: string;
  sheetName?: string;
  title?: string;
}): Promise<SavedReport> {
  const response = await api.post<{ success: boolean; report: SavedReport }>("/api/reports", data);
  return response.data.report;
}

export async function deleteReport(id: string): Promise<void> {
  await api.delete(`/api/reports/${id}`);
}

export async function downloadReportFile(id: string, title?: string): Promise<void> {
  const response = await api.get(`/api/reports/${id}/download`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "text/markdown" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${(title || "insightflow-report").toLowerCase().replace(/[^a-z0-9_-]/g, "_")}.md`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
