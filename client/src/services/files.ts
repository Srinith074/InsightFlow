import { api } from "@/utils/api";

export interface DatasetItem {
  id: string;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  rowCount: number;
  columnCount: number;
  headers: string[];
  createdAt: string;
}

export async function getDatasets() {
  const response = await api.get("/api/datasets");
  return response.data.datasets;
}

export async function deleteDataset(id: string) {
  await api.delete(`/api/datasets/${id}`);
}