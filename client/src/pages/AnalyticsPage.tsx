import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Database,
  FileSpreadsheet,
  Filter,
  Layers,
  Package,
  Search,
  SlidersHorizontal,
  Sparkles,
  TableProperties,
  TrendingDown,
  UploadCloud,
} from "lucide-react";

import { SectionHeader } from "@/components/common/SectionHeader";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
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

const COLORS = [
  "var(--color-primary, #6366f1)",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
];

export function AnalyticsPage() {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Filter & tab controls
  const [activeTab, setActiveTab] = useState<"drivers" | "products" | "volume" | "explorer">("drivers");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [searchTableQuery, setSearchTableQuery] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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

  const handleDatasetChange = (id: string) => {
    setSelectedDatasetId(id);
    const dataset = datasets.find((d) => d.id === id);
    const firstSheet = dataset?.sheetNames?.[0] || dataset?.selectedSheet || "";
    setSelectedSheet(firstSheet);
    setProductFilter("all");
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
        setProductFilter("all");
      } catch (error) {
        console.error("Failed to load analytics:", error);
        setDashboard(null);
      } finally {
        setLoadingAnalytics(false);
      }
    }

    loadAnalytics();
  }, [selectedDatasetId, selectedSheet]);

  // Derived Analytics Data
  const capabilities = dashboard?.capabilities ?? {
    hasTimeDimension: false,
    hasProductDimension: false,
    hasCategoryDimension: false,
    hasQuantityDimension: false,
    hasRegionDimension: false,
  };

  const productList = dashboard?.productAnalytics?.topProducts ?? [];
  const bottomProducts = dashboard?.productAnalytics?.bottomProducts ?? [];
  const categoryList = dashboard?.categoryAnalytics?.categories ?? [];
  // Filtered Time Series if product filter is applied
  const filteredTimeSeries = useMemo(() => {
    const list = dashboard?.timeSeries ?? [];
    return list.map((t) => ({
      name: t.period.length > 3 ? t.period.slice(0, 3) : t.period,
      fullPeriod: t.period,
      revenue: t.revenue,
      quantity: t.quantity,
      transactions: t.transactions,
      avgOrderValue: t.avgOrderValue,
    }));
  }, [dashboard]);

  // Filtered & Sorted Raw Data Rows
  const filteredRows = useMemo(() => {
    let rows = [...(dashboard?.sampleRows ?? [])];

    if (productFilter !== "all" && dashboard?.detectedSchema?.productColumn) {
      const prodCol = dashboard.detectedSchema.productColumn;
      rows = rows.filter((r) => String(r[prodCol] ?? "").trim() === productFilter);
    }

    if (searchTableQuery.trim()) {
      const q = searchTableQuery.toLowerCase();
      rows = rows.filter((row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(q))
      );
    }

    if (sortColumn) {
      rows.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        const numA = Number(valA);
        const numB = Number(valB);

        if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
          return sortDirection === "asc" ? numA - numB : numB - numA;
        }

        const strA = String(valA ?? "").toLowerCase();
        const strB = String(valB ?? "").toLowerCase();
        return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return rows;
  }, [dashboard, productFilter, searchTableQuery, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

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
          title="Analytics"
          description="In-depth multi-dimensional data exploration and schema diagnostics."
        />

        <Card className="border-dashed border-border bg-card/50 p-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <BarChart3 className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground">No dataset available for analytics</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Upload an Excel or CSV file to explore detailed time-series, product drivers, volume metrics, and raw column distributions.
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

  return (
    <div className="grid gap-6">
      {/* Workspace Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Analytics Workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Deep-dive multi-dimensional data analysis, performance diagnostics, and schema diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/dashboard/ai-chat">
            <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5 text-xs">
              <Sparkles className="size-3.5" />
              Ask AI Analyst
            </Button>
          </Link>
        </div>
      </div>

      {/* Dataset & Sheet Selector with Capability Badges */}
      <Card className="border border-border bg-card/90 shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-4">
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

          {/* Detected Schema Capabilities Badges */}
          {dashboard && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 text-xs">
              <span className="text-muted-foreground font-medium mr-1 flex items-center gap-1">
                <SlidersHorizontal className="size-3" />
                Detected Dimensions:
              </span>
              <Badge variant={capabilities.hasTimeDimension ? "default" : "outline"} className="text-[11px]">
                {capabilities.hasTimeDimension ? "✓ Time / Period" : "✕ No Date Column"}
              </Badge>
              <Badge variant={capabilities.hasProductDimension ? "default" : "outline"} className="text-[11px]">
                {capabilities.hasProductDimension ? "✓ Products / SKUs" : "✕ No Products"}
              </Badge>
              <Badge variant={capabilities.hasCategoryDimension ? "default" : "outline"} className="text-[11px]">
                {capabilities.hasCategoryDimension ? "✓ Category / Dept" : "✕ No Categories"}
              </Badge>
              <Badge variant={capabilities.hasQuantityDimension ? "default" : "outline"} className="text-[11px]">
                {capabilities.hasQuantityDimension ? "✓ Quantity / Units" : "✕ No Volume Units"}
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                {dashboard.columnCount || 0} Total Columns
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {loadingAnalytics ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Running deep analytics calculations on {selectedSheet || "active dataset"}...
        </div>
      ) : !dashboard ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No analytics data available for the selected sheet.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Workspace Navigation Tabs & Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <Button
                variant={activeTab === "drivers" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("drivers")}
                className="text-xs"
              >
                📈 Time & Run Rate
              </Button>
              <Button
                variant={activeTab === "products" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("products")}
                className="text-xs"
              >
                🏷️ Products & Drivers
              </Button>
              <Button
                variant={activeTab === "volume" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("volume")}
                className="text-xs"
              >
                📦 Volume & Economics
              </Button>
              <Button
                variant={activeTab === "explorer" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("explorer")}
                className="text-xs"
              >
                🔍 Data Explorer & Schema
              </Button>
            </div>

            {/* Dynamic Product Filter if product dimension exists */}
            {capabilities.hasProductDimension && productList.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Filter className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">Focus Filter:</span>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="h-8 cursor-pointer rounded-xl border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Products ({productList.length})</option>
                  {productList.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* TAB 1: TIME & RUN RATE */}
          {activeTab === "drivers" && (
            <div className="grid gap-6">
              {capabilities.hasTimeDimension && filteredTimeSeries.length > 0 ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border border-border bg-card p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Peak Interval
                      </p>
                      <p className="mt-1 text-xl font-bold text-foreground">
                        {dashboard.timeStats?.maxPeriod || "N/A"}
                      </p>
                      <p className="text-xs text-primary mt-1 font-medium">
                        ₹{(dashboard.timeStats?.maxRevenue || 0).toLocaleString("en-IN")}
                      </p>
                    </Card>

                    <Card className="border border-border bg-card p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Lowest Interval
                      </p>
                      <p className="mt-1 text-xl font-bold text-foreground">
                        {dashboard.timeStats?.minPeriod || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ₹{(dashboard.timeStats?.minRevenue || 0).toLocaleString("en-IN")}
                      </p>
                    </Card>

                    <Card className="border border-border bg-card p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Average Run Rate
                      </p>
                      <p className="mt-1 text-xl font-bold text-foreground">
                        ₹{(dashboard.timeStats?.avgPeriodRevenue || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">per time period</p>
                    </Card>
                  </div>

                  <Card className="border border-border bg-card p-5 shadow-sm">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle className="text-base font-semibold">Periodic Revenue Trajectory</CardTitle>
                      <CardDescription>
                        Time-series trend calculated across {filteredTimeSeries.length} periods
                      </CardDescription>
                    </CardHeader>
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={filteredTimeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} opacity={0.5} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)" }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-popover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "12px",
                          }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => [`₹${Number(value || 0).toLocaleString("en-IN")}`, "Revenue"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--color-primary, #6366f1)"
                          fill="url(#analyticsGradient)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              ) : (
                <Card className="border-dashed border-border bg-card/60 p-10 text-center">
                  <Calendar className="size-8 mx-auto mb-2 text-muted-foreground/60" />
                  <h3 className="font-semibold text-foreground">Time-Series Analysis Requires a Date Dimension</h3>
                  <p className="max-w-md mx-auto mt-1 text-xs text-muted-foreground">
                    This uploaded spreadsheet does not contain a recognized date or timestamp column. Switch to the Products or Data Explorer tab to explore other dimensions.
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS & DRIVERS */}
          {activeTab === "products" && (
            <div className="grid gap-6">
              {capabilities.hasProductDimension && productList.length > 0 ? (
                <>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Top Revenue Contributors Bar Chart */}
                    <Card className="border border-border bg-card p-5 shadow-sm">
                      <CardHeader className="p-0 pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold">Top Revenue Contributors</CardTitle>
                          <Badge variant="secondary">{productList.length} products</Badge>
                        </div>
                        <CardDescription>Highest grossing items in this dataset</CardDescription>
                      </CardHeader>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={productList.slice(0, 6)} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                          <CartesianGrid stroke="var(--color-border)" horizontal={false} opacity={0.4} />
                          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} width={90} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: "12px" }}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: any) => [`₹${Number(value || 0).toLocaleString("en-IN")}`, "Revenue"]}
                          />
                          <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                            {productList.slice(0, 6).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* Category Breakdown or Share Table */}
                    <Card className="border border-border bg-card p-5 shadow-sm">
                      <CardHeader className="p-0 pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold">
                            {capabilities.hasCategoryDimension ? "Category Distribution" : "Pareto Contribution Share"}
                          </CardTitle>
                          <Badge variant="secondary">
                            {capabilities.hasCategoryDimension ? `${categoryList.length} categories` : "Top items"}
                          </Badge>
                        </div>
                        <CardDescription>
                          {capabilities.hasCategoryDimension
                            ? "Revenue categorized by segment"
                            : "Share of total gross sales"}
                        </CardDescription>
                      </CardHeader>
                      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                        {(capabilities.hasCategoryDimension ? categoryList : productList.slice(0, 6)).map((item) => (
                          <div key={item.name} className="space-y-1.5 rounded-2xl bg-muted/40 p-3">
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span className="text-foreground truncate max-w-[180px]">{item.name}</span>
                              <span className="font-semibold text-foreground">
                                ₹{item.revenue.toLocaleString("en-IN")} ({item.share}%)
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${Math.min(100, Math.max(3, item.share))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Comprehensive Product Performance Table */}
                  <Card className="border border-border bg-card shadow-sm">
                    <CardHeader className="p-5 border-b border-border">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Comprehensive Product Rankings</CardTitle>
                        <Badge variant="outline">{productList.length} tracked items</Badge>
                      </div>
                      <CardDescription>
                        Complete rankings with revenue contribution share, transaction counts, and unit economics
                      </CardDescription>
                    </CardHeader>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead className="text-right">Total Revenue</TableHead>
                          <TableHead className="text-right">Share %</TableHead>
                          <TableHead className="text-right">Transactions</TableHead>
                          {capabilities.hasQuantityDimension && <TableHead className="text-right">Units Sold</TableHead>}
                          {capabilities.hasQuantityDimension && <TableHead className="text-right">Avg Unit Price</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productList.map((p, idx) => (
                          <TableRow key={p.name}>
                            <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                            <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                            <TableCell className="text-right font-semibold">₹{p.revenue.toLocaleString("en-IN")}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{p.share}%</TableCell>
                            <TableCell className="text-right text-muted-foreground">{p.transactions}</TableCell>
                            {capabilities.hasQuantityDimension && (
                              <TableCell className="text-right text-muted-foreground">{p.quantity}</TableCell>
                            )}
                            {capabilities.hasQuantityDimension && (
                              <TableCell className="text-right font-mono text-xs">
                                {p.avgPrice > 0 ? `₹${p.avgPrice}` : "-"}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>

                  {/* Bottom Performers / Underperformers Callout */}
                  {bottomProducts.length > 0 && (
                    <Card className="border border-border bg-card p-5 shadow-sm">
                      <CardHeader className="p-0 pb-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <TrendingDown className="size-4 text-amber-500" />
                          <CardTitle className="text-sm font-semibold text-foreground">
                            Underperforming Items (Lowest Revenue)
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          Items generating the smallest portion of sales in this sheet
                        </CardDescription>
                      </CardHeader>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-1">
                        {bottomProducts.map((p) => (
                          <div key={p.name} className="rounded-2xl border border-border bg-muted/30 p-3">
                            <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                            <p className="text-sm font-bold text-foreground mt-1">
                              ₹{p.revenue.toLocaleString("en-IN")}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{p.share}% of total</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="border-dashed border-border bg-card/60 p-10 text-center">
                  <Layers className="size-8 mx-auto mb-2 text-muted-foreground/60" />
                  <h3 className="font-semibold text-foreground">No Product Dimension Detected</h3>
                  <p className="max-w-md mx-auto mt-1 text-xs text-muted-foreground">
                    This spreadsheet does not have a recognizable product column. Check the Data Explorer tab to inspect raw columns.
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* TAB 3: VOLUME & ECONOMICS */}
          {activeTab === "volume" && (
            <div className="grid gap-6">
              {capabilities.hasQuantityDimension ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border border-border bg-card p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Volume / Units
                      </p>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {dashboard.quantityAnalytics?.totalQuantity.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Units processed across sheet</p>
                    </Card>

                    <Card className="border border-border bg-card p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Avg Units / Record
                      </p>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {dashboard.quantityAnalytics?.avgQuantityPerRow}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Units per recorded row</p>
                    </Card>

                    <Card className="border border-border bg-card p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Highest Volume Product
                      </p>
                      <p className="mt-1 text-xl font-bold text-foreground truncate">
                        {dashboard.quantityAnalytics?.highestVolumeProduct || "N/A"}
                      </p>
                      <p className="text-xs text-primary mt-1 font-medium">Top unit mover</p>
                    </Card>
                  </div>

                  {/* Volume vs Revenue Bar Chart */}
                  <Card className="border border-border bg-card p-5 shadow-sm">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle className="text-base font-semibold">Volume vs Revenue Comparison</CardTitle>
                      <CardDescription>Units sold compared against generated revenue</CardDescription>
                    </CardHeader>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={productList.slice(0, 8)} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} opacity={0.4} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                        <YAxis yAxisId="left" orientation="left" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)" }} />
                        <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)" }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: "12px" }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill="var(--color-primary, #6366f1)" radius={[6, 6, 0, 0]} />
                        <Bar yAxisId="right" dataKey="quantity" name="Quantity (Units)" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              ) : (
                <Card className="border-dashed border-border bg-card/60 p-10 text-center">
                  <Package className="size-8 mx-auto mb-2 text-muted-foreground/60" />
                  <h3 className="font-semibold text-foreground">Volume Analysis Requires a Quantity Column</h3>
                  <p className="max-w-md mx-auto mt-1 text-xs text-muted-foreground">
                    This sheet does not contain a recognizable quantity or unit count field (e.g. Quantity, Qty, Units Sold).
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* TAB 4: DATA EXPLORER & SCHEMA */}
          {activeTab === "explorer" && (
            <div className="grid gap-6">
              {/* Column Summary Statistics Cards */}
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="p-5 border-b border-border">
                  <div className="flex items-center gap-2 text-primary">
                    <TableProperties className="size-5" />
                    <CardTitle className="text-base font-semibold">Column Schema & Summary Statistics</CardTitle>
                  </div>
                  <CardDescription>
                    Summary metrics (Sum, Average, Min, Max, Distinct values) across all detected columns
                  </CardDescription>
                </CardHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column Name</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead className="text-right">Distinct Values</TableHead>
                      <TableHead className="text-right">Sum</TableHead>
                      <TableHead className="text-right">Average</TableHead>
                      <TableHead className="text-right">Min / Max</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(dashboard.columnSummaries ?? []).map((col) => (
                      <TableRow key={col.header}>
                        <TableCell className="font-medium text-foreground">{col.header}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize text-[11px]">
                            {col.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">{col.distinctCount}</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {col.sum !== undefined ? `₹${col.sum.toLocaleString("en-IN")}` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {col.avg !== undefined ? `₹${col.avg.toLocaleString("en-IN")}` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {col.min !== undefined && col.max !== undefined
                            ? `${col.min} / ${col.max}`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {/* Interactive Raw Data Table with Search & Sort */}
              <Card className="border border-border bg-card shadow-sm">
                <CardHeader className="p-5 border-b border-border space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Interactive Data Explorer</CardTitle>
                      <CardDescription>
                        Search, sort, and inspect raw spreadsheet records (showing top {filteredRows.length} rows)
                      </CardDescription>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search rows..."
                        value={searchTableQuery}
                        onChange={(e) => setSearchTableQuery(e.target.value)}
                        className="h-8 pl-8 text-xs rounded-xl"
                      />
                    </div>
                  </div>
                </CardHeader>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {dashboard.headers?.map((header) => (
                          <TableHead
                            key={header}
                            onClick={() => handleSort(header)}
                            className="cursor-pointer select-none hover:text-foreground whitespace-nowrap"
                          >
                            <div className="flex items-center gap-1">
                              <span>{header}</span>
                              {sortColumn === header ? (
                                sortDirection === "asc" ? (
                                  <ChevronUp className="size-3 text-primary" />
                                ) : (
                                  <ChevronDown className="size-3 text-primary" />
                                )
                              ) : null}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={dashboard.headers?.length || 1} className="p-6 text-center text-muted-foreground">
                            No rows matching query "{searchTableQuery}".
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRows.map((row, rowIdx) => (
                          <TableRow key={rowIdx}>
                            {dashboard.headers?.map((header) => (
                              <TableCell key={`${rowIdx}-${header}`} className="text-xs text-foreground whitespace-nowrap">
                                {String(row[header] ?? "")}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
