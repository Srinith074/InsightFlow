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

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post<{ dataset: DatasetMetadata }>(
    "/api/datasets/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.dataset;
}
