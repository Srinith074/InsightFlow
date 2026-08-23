import { api } from "@/utils/api";

export interface DetectedSchema {
  dateColumn: string | null;
  revenueColumn: string | null;
  quantityColumn: string | null;
  productColumn: string | null;
  categoryColumn: string | null;
  regionColumn: string | null;
  numericColumns: string[];
  textColumns: string[];
}

export interface AnalyticsCapabilities {
  hasTimeDimension: boolean;
  hasProductDimension: boolean;
  hasCategoryDimension: boolean;
  hasQuantityDimension: boolean;
  hasRegionDimension: boolean;
}

export interface ProductMetric {
  name: string;
  revenue: number;
  quantity: number;
  transactions: number;
  share: number;
  avgPrice: number;
}

export interface CategoryMetric {
  name: string;
  revenue: number;
  quantity: number;
  transactions: number;
  share: number;
}

export interface RegionMetric {
  name: string;
  revenue: number;
  quantity: number;
  share: number;
}

export interface ColumnSummary {
  header: string;
  type: "numeric" | "categorical" | "date";
  distinctCount: number;
  sum?: number;
  avg?: number;
  min?: number | string;
  max?: number | string;
}

export interface DashboardData {
  // Executive Overview Metrics
  totalRows: number;
  totalRevenue: number;
  averageRevenue: number;
  totalQuantity?: number;
  topProduct: string;
  topProductSales: number;
  topProductShare?: number;
  bestPeriod?: { period: string; revenue: number } | null;
  growthRate?: number | null;
  executiveInsights?: string[];
  productSales: Record<string, number>;
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];

  // Deep Analytics Exploration Fields
  detectedSchema?: DetectedSchema;
  capabilities?: AnalyticsCapabilities;
  timeSeries?: {
    period: string;
    revenue: number;
    quantity: number;
    transactions: number;
    avgOrderValue: number;
  }[];
  timeStats?: {
    minPeriod: string;
    minRevenue: number;
    maxPeriod: string;
    maxRevenue: number;
    avgPeriodRevenue: number;
  } | null;
  productAnalytics?: {
    topProducts: ProductMetric[];
    bottomProducts: ProductMetric[];
    totalProducts: number;
  };
  categoryAnalytics?: {
    categories: CategoryMetric[];
    topCategory: string | null;
  };
  regionalAnalytics?: {
    regions: RegionMetric[];
  };
  quantityAnalytics?: {
    totalQuantity: number;
    avgQuantityPerRow: number;
    highestVolumeProduct: string | null;
  } | null;
  columnSummaries?: ColumnSummary[];
  sampleRows?: Record<string, unknown>[];

  // Sheet Metadata
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