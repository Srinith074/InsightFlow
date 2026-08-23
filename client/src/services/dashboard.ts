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
  sheetName?: string;
  availableSheets?: string[];
  headers?: string[];
  columnCount?: number;
}

export async function fetchDashboard(
  datasetId: string,
  sheetName?: string
): Promise<DashboardData> {
  const url = sheetName
    ? `/api/dashboard/${datasetId}/sheet/${encodeURIComponent(sheetName)}`
    : `/api/dashboard/${datasetId}`;

  const response = await api.get<DashboardData>(url);
  return response.data;
}