import { api } from "@/utils/api";

export interface DashboardData {
  totalRows: number;
  totalRevenue: number;
  averageRevenue: number;
  topProduct: string;
  topProductSales: number;
  productSales: Record<string, number>;
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
}

export async function deleteDataset(id: string) {
  return api.delete(`/api/datasets/${id}`);
}

export async function fetchDashboard(datasetId: string) {
  const response = await api.get<DashboardData>(
    `/api/dashboard/${datasetId}`
  );

  return response.data;
}