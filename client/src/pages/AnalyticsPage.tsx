import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeader } from "@/components/common/SectionHeader";
import { RevenueTrend } from "@/components/charts/RevenueTrend";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { fetchDatasets } from "@/services/datasets";
import { fetchDashboard, type DashboardData } from "@/services/dashboard";
import type { DatasetMetadata } from "@/types";
import {
  BarChart3,
  Database,
  FileSpreadsheet,
  Layers,
  TableProperties,
  UploadCloud,
} from "lucide-react";

export function AnalyticsPage() {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);
  const sheetNames = selectedDataset?.sheetNames ?? [];

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

  const handleDatasetChange = (id: string) => {
    setSelectedDatasetId(id);
    const dataset = datasets.find((d) => d.id === id);
    const firstSheet = dataset?.sheetNames?.[0] || dataset?.selectedSheet || "";
    setSelectedSheet(firstSheet);
  };

  useEffect(() => {
    async function loadAnalytics() {
      if (!selectedDatasetId) {
        setDashboard(null);
        return;
      }

      try {
        setLoadingAnalytics(true);
        const data = await fetchDashboard(selectedDatasetId, selectedSheet || undefined);
        setDashboard(data);
      } catch (error) {
        console.error("Failed to load analytics:", error);
        setDashboard(null);
      } finally {
        setLoadingAnalytics(false);
      }
    }

    loadAnalytics();
  }, [selectedDatasetId, selectedSheet]);

  if (loadingDatasets) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading analytics engine...
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="grid gap-6">
        <SectionHeader
          title="Analytics"
          description="In-depth deterministic data analysis and workbook schema inspection."
        />

        <Card className="border-dashed border-border bg-card/50 p-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <BarChart3 className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground">No dataset available for analysis</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Upload an Excel or CSV file to explore schema structures, KPI metrics, and revenue trajectories.
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

  const productsList = Object.entries(dashboard?.productSales ?? {}).sort(
    ([, a], [, b]) => b - a
  );

  const headersList = dashboard?.headers ?? selectedDataset?.headers ?? [];

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Analytics"
        description="Deep performance insights, distribution metrics, and schema inspection computed directly from raw data."
      />

      {/* Dataset & Sheet Selector */}
      <Card className="border border-border bg-card/90 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Database className="size-4 text-primary" />
                Dataset
              </div>
              <select
                value={selectedDatasetId}
                onChange={(e) => handleDatasetChange(e.target.value)}
                className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary sm:max-w-xs"
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
                  Sheet
                </div>
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary sm:max-w-xs"
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

      {loadingAnalytics ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Computing analytics metrics...
        </div>
      ) : !dashboard ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No analytics data available for the selected sheet.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Revenue
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                ₹{dashboard.totalRevenue.toLocaleString("en-IN")}
              </p>
              <Badge variant="secondary" className="mt-2 text-xs">Deterministic</Badge>
            </Card>

            <Card className="border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Average Revenue / Row
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                ₹{Math.round(dashboard.averageRevenue).toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Computed across rows</p>
            </Card>

            <Card className="border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Records
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {dashboard.totalRows.toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Indexed data rows</p>
            </Card>

            <Card className="border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Schema Columns
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {headersList.length}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Detected headers</p>
            </Card>
          </div>

          {/* Revenue Trend Chart */}
          {chartData.length > 0 && <RevenueTrend data={chartData} />}

          {/* Product Breakdown & Schema Details */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Product Performance Table */}
            <Card className="border border-border bg-card/90 shadow-sm">
              <CardHeader className="space-y-1 p-5">
                <div className="flex items-center gap-2 text-primary">
                  <Layers className="size-5" />
                  <CardTitle className="text-base font-semibold">Product Breakdown</CardTitle>
                </div>
                <CardDescription>
                  Volume and revenue distribution per item in this sheet
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {productsList.length === 0 ? (
                  <p className="p-5 text-sm text-muted-foreground">No individual product breakdown detected.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product / Item</TableHead>
                        <TableHead className="text-right">Total Revenue</TableHead>
                        <TableHead className="text-right">Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsList.map(([product, revenue]) => {
                        const share =
                          dashboard.totalRevenue > 0
                            ? ((revenue / dashboard.totalRevenue) * 100).toFixed(1)
                            : "0";
                        return (
                          <TableRow key={product}>
                            <TableCell className="font-medium text-foreground">
                              {product}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ₹{revenue.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {share}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Schema / Headers Table */}
            <Card className="border border-border bg-card/90 shadow-sm">
              <CardHeader className="space-y-1 p-5">
                <div className="flex items-center gap-2 text-primary">
                  <TableProperties className="size-5" />
                  <CardTitle className="text-base font-semibold">Sheet Schema & Headers</CardTitle>
                </div>
                <CardDescription>
                  Structure and data fields identified in "{dashboard.sheetName || selectedSheet}"
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {headersList.length === 0 ? (
                  <p className="p-5 text-sm text-muted-foreground">No headers found in this sheet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Column Header</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {headersList.map((header, idx) => (
                        <TableRow key={`${header}-${idx}`}>
                          <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-medium text-foreground">{header}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">Active</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
