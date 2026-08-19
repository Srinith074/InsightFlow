import { api } from "@/utils/api";

export interface DatasetMetadata {
  id: string;

  name: string;

  fileName: string;

  rowCount: number;

  columnCount: number;

  sheetNames: string[];

  selectedSheet: string;

  createdAt: string;
}

interface DatasetsResponse {
  datasets: DatasetMetadata[];
}

interface UploadDatasetResponse {
  dataset: DatasetMetadata;
}

export async function fetchDatasets(): Promise<DatasetMetadata[]> {
  const response = await api.get<DatasetsResponse>("/api/datasets");

  console.log("Datasets from server:", response.data.datasets);

  return response.data.datasets;
}

export async function uploadDataset(file: File): Promise<DatasetMetadata> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<UploadDatasetResponse>(
    "/api/datasets",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.dataset;
}