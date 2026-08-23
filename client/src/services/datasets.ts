import { api } from "@/utils/api";
import type { DatasetMetadata } from "@/types";

interface DatasetsResponse {
  datasets: DatasetMetadata[];
}

export async function fetchDatasets(): Promise<DatasetMetadata[]> {
  const response = await api.get<DatasetsResponse>("/api/datasets");
  return response.data.datasets;
}

export async function uploadDataset(files: File[]): Promise<DatasetMetadata> {
  const formData = new FormData();

  if (files.length > 0) {
    formData.append("file", files[0]);
  }

  const response = await api.post<{ dataset: DatasetMetadata }>(
    "/api/datasets",
    formData
  );

  return response.data.dataset;
}

export interface DatasetPreviewResponse {
  rows: Record<string, unknown>[];
  totalRows: number;
  page: number;
  limit: number;
  totalPages: number;
  headers: string[];
  sheetName: string;
  availableSheets: string[];
}

export interface ColumnSchemaInfo {
  name: string;
  inferredType: string;
  sampleValues: (string | number | boolean)[];
  totalCount: number;
  nullCount: number;
  distinctCount: number;
  min?: string | number;
  max?: string | number;
  description: string;
}

export interface DataQualityReport {
  totalRows: number;
  columnCount: number;
  qualityScore: number;
  missingValuesCount: number;
  duplicateRowsCount: number;
  invalidDateCount: number;
  invalidNumericCount: number;
  warnings: string[];
}

export interface DatasetSchemaResponse {
  schema: {
    domain: string;
    columns: ColumnSchemaInfo[];
    quality: DataQualityReport;
    keyDimensions: {
      dateColumn: string | null;
      primaryMetricColumn: string | null;
      primaryMetricType: string;
      dimensionColumn: string | null;
      categoryColumn: string | null;
      quantityColumn: string | null;
    };
  };
  sheetName: string;
  availableSheets: string[];
  dataset: {
    id: string;
    name: string;
    fileName: string;
    size: number;
    rowCount: number;
    columnCount: number;
    createdAt: string;
  };
}

export async function fetchDatasetPreview(
  datasetId: string,
  sheetName?: string,
  page = 1,
  limit = 50
): Promise<DatasetPreviewResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (sheetName) {
    query.set("sheetName", sheetName);
  }

  const response = await api.get<DatasetPreviewResponse>(
    `/api/datasets/${datasetId}/preview?${query.toString()}`
  );
  return response.data;
}

export async function fetchDatasetSchema(
  datasetId: string,
  sheetName?: string
): Promise<DatasetSchemaResponse> {
  const url = sheetName
    ? `/api/datasets/${datasetId}/schema?sheetName=${encodeURIComponent(sheetName)}`
    : `/api/datasets/${datasetId}/schema`;

  const response = await api.get<DatasetSchemaResponse>(url);
  return response.data;
}

export async function deleteDataset(id: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<{ success: boolean; message: string }>(`/api/datasets/${id}`);
  return response.data;
}
