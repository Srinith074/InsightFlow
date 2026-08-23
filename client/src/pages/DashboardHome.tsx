import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchDashboard,
  type DashboardData,
} from "@/services/dashboard";
import { fetchDatasets } from "@/services/datasets";
import type { DatasetMetadata } from "@/types";

import { SectionHeader } from "@/components/common/SectionHeader";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { RevenueTrend } from "@/components/charts/RevenueTrend";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
  Badge,
} from "@/components/ui";
import { BarChart3, Database, FileSpreadsheet, Sparkles, UploadCloud } from "lucide-react";

export function DashboardHome() {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);
  const sheetNames = selectedDataset?.sheetNames ?? [];

  // Load datasets on mount
  useEffect(() => {
    async function loadDatasets() {
      try {
        setLoadingDatasets(true);
        const data = await fetchDatasets();
        setDatasets(data);

        if (data.length > 0) {
          const first = data[0];
          setSelectedDatasetId(first.id);
          const firstSheet = first.sheetNames?.[0] || first.selectedSheet || "";
          setSelectedSheet(firstSheet);
        }
      } catch (error) {
        console.error("Failed to load datasets:", error);
      } finally {
        setLoadingDatasets(false);
      }
    }

    loadDatasets();
  }, []);

  // When dataset selection changes, update sheet selection
  const handleDatasetChange = (id: string) => {
    setSelectedDatasetId(id);
    const dataset = datasets.find((d) => d.id === id);
    const firstSheet = dataset?.sheetNames?.[0] || dataset?.selectedSheet || "";
    setSelectedSheet(firstSheet);
  };

  // Load dashboard data when dataset or sheet changes
  useEffect(() => {
    async function loadDashboardData() {
      if (!selectedDatasetId) {
        setDashboard(null);
        return;
      }

      try {
        setLoadingDashboard(true);
        const data = await fetchDashboard(selectedDatasetId, selectedSheet || undefined);
        setDashboard(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setDashboard(null);
      } finally {
        setLoadingDashboard(false);
      }
    }

    loadDashboardData();
  }, [selectedDatasetId, selectedSheet]);

  if (loadingDatasets) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading analytics workspace...
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="grid gap-6">
        <SectionHeader
          title="Overview"
          description="Your analytics workspace for every dataset, insight, and AI conversation."
        />

        <Card className="border-dashed border-border bg-card/50 p-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <UploadCloud className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground">No datasets uploaded yet</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Upload your first Excel (.xlsx, .xls) or CSV dataset to unlock live deterministic KPIs, revenue trends, and AI analysis.
              </p>
            </div>
            <Link to="/dashboard/upload">
              <Button className="mt-2 inline-flex items-center gap-2">
                <UploadCloud className="size-4" />
                Upload Dataset
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = (dashboard?.monthlyRevenue ?? []).map((item) => ({
    name: item.month.slice(0, 3),
    revenue: item.revenue,
    growth: 0,
  }));

  const productBreakdown = Object.entries(dashboard?.productSales ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Overview"
        description="Live performance, revenue trends, and product intelligence calculated directly from your datasets."
      />

      {/* Dataset and Sheet Selector Toolbar */}
      <Card className="border border-border bg-card/90 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Database className="size-4 text-primary" />
                Active Dataset
              </div>
              <select
                value={selectedDatasetId}
                onChange={(e) => handleDatasetChange(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-2xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary sm:max-w-xs"
              >
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
            </div>

            {sheetNames.length > 0 && (
              <div className="flex flex-1 flex-col gap-1 sm:items-end">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileSpreadsheet className="size-4 text-primary" />
                  Workbook Sheet
                </div>
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-2xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary sm:max-w-xs"
                >
                  {sheetNames.map((sheet) => (
                    <option key={sheet} value={sheet}>
                      {sheet}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {loadingDashboard ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Calculating live metrics for selected sheet...
        </div>
      ) : !dashboard ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No analytics data available for the selected sheet.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key KPI Overview Cards */}
          <OverviewCards dashboard={dashboard} />

          {/* Revenue Trend Chart & Product Breakdown */}
          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {chartData.length > 0 ? (
              <RevenueTrend data={chartData} />
            ) : (
              <Card className="flex items-center justify-center border border-border bg-card p-8 text-muted-foreground">
                No monthly date trends detected in this sheet.
              </Card>
            )}

            {/* Product Performance Summary */}
            <Card className="border border-border bg-card/90 p-5 shadow-sm">
              <CardHeader className="space-y-1 p-0 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <BarChart3 className="size-5" />
                    <CardTitle className="text-base font-semibold">Top Products</CardTitle>
                  </div>
                  <Badge variant="secondary">{productBreakdown.length} items</Badge>
                </div>
                <CardDescription>Highest revenue contributors in this sheet</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 p-0">
                {productBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No individual product columns found.</p>
                ) : (
                  productBreakdown.map(([product, sales]) => (
                    <div
                      key={product}
                      className="flex items-center justify-between rounded-2xl bg-muted/60 p-3 text-sm"
                    >
                      <span className="font-medium text-foreground truncate max-w-[160px]">
                        {product}
                      </span>
                      <span className="font-semibold text-foreground">
                        ₹{sales.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))
                )}

                <div className="pt-2">
                  <Link to="/dashboard/ai-chat">
                    <Button variant="outline" className="w-full inline-flex items-center justify-center gap-2">
                      <Sparkles className="size-4" />
                      Ask AI Analyst About This Sheet
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Datasets Table */}
          <Card className="border border-border bg-card/90 shadow-sm">
            <CardHeader className="space-y-1 p-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Datasets</CardTitle>
                <Link to="/dashboard/datasets">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              </div>
              <CardDescription>Datasets currently indexed in your workspace</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="divide-y divide-border">
                {datasets.slice(0, 4).map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.rowCount} rows • {d.columnCount} columns • {d.sheetNames?.length ?? 1} sheet(s)
                      </p>
                    </div>
                    <Badge variant={d.id === selectedDatasetId ? "default" : "secondary"}>
                      {d.id === selectedDatasetId ? "Active" : "Ready"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}