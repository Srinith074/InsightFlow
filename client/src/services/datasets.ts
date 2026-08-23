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

export async function deleteDataset(id: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<{ success: boolean; message: string }>(`/api/datasets/${id}`);
  return response.data;
}
