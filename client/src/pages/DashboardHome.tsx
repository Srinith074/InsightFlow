import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchDashboard,
  type DashboardData,
} from "@/services/dashboard";
import { fetchDatasets } from "@/services/datasets";
import { fetchInsights, createSavedInsight, type SavedInsight } from "@/services/insights";
import { fetchReports, type SavedReport } from "@/services/reports";
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
import {
  BarChart3,
  Bookmark,
  BookmarkPlus,
  Check,
  Database,
  FileSpreadsheet,
  FileText,
  Sparkles,
  UploadCloud,
} from "lucide-react";

export function DashboardHome() {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [recentInsights, setRecentInsights] = useState<SavedInsight[]>([]);
  const [recentReports, setRecentReports] = useState<SavedReport[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [savedBulletIndexes, setSavedBulletIndexes] = useState<Set<number>>(new Set());

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);
  const sheetNames = selectedDataset?.sheetNames ?? [];

  // Load datasets, recent insights & reports on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoadingDatasets(true);
        const [datasetsData, insightsData, reportsData] = await Promise.all([
          fetchDatasets(),
          fetchInsights().catch(() => []),
          fetchReports().catch(() => []),
        ]);
        setDatasets(datasetsData);
        setRecentInsights(insightsData.slice(0, 3));
        setRecentReports(reportsData.slice(0, 3));

        if (datasetsData.length > 0) {
          const first = datasetsData[0];
          setSelectedDatasetId(first.id);
          const firstSheet = first.sheetNames?.[0] || first.selectedSheet || "";
          setSelectedSheet(firstSheet);
        }
      } catch (error) {
        console.error("Failed to load dashboard initial data:", error);
      } finally {
        setLoadingDatasets(false);
      }
    }

    loadInitialData();
  }, []);

  // When dataset selection changes, update sheet selection
  const handleDatasetChange = (id: string) => {
    setSelectedDatasetId(id);
    const dataset = datasets.find((d) => d.id === id);
    const firstSheet = dataset?.sheetNames?.[0] || dataset?.selectedSheet || "";
    setSelectedSheet(firstSheet);
    setSavedBulletIndexes(new Set());
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

  const handleSaveInsight = async (insightText: string, idx: number) => {
    if (!selectedDataset) return;
    try {
      await createSavedInsight({
        datasetId: selectedDataset.id,
        datasetName: selectedDataset.name,
        sheetName: dashboard?.sheetName || selectedSheet || "Sheet1",
        title: `Key Discovery: ${insightText.slice(0, 45)}...`,
        content: insightText,
        category: "revenue",
      });
      setSavedBulletIndexes((prev) => new Set([...prev, idx]));
      // Refresh recent insights
      const updated = await fetchInsights();
      setRecentInsights(updated.slice(0, 3));
    } catch (error) {
      console.error("Failed to save insight:", error);
    }
  };

  if (loadingDatasets) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading executive dashboard...
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="grid gap-6">
        <SectionHeader
          title="Overview"
          description="Your executive dashboard for every dataset, business insight, and AI conversation."
        />

        <Card className="border-dashed border-border bg-card/50 p-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <UploadCloud className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground">No datasets uploaded yet</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Upload your first Excel (.xlsx, .xls) or CSV dataset to unlock live deterministic KPIs, executive trends, and AI analysis.
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
        description="Executive business summary, revenue trajectory, and automated data intelligence."
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
          Computing executive summary metrics for selected sheet...
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

          {/* Automated Executive Highlights Summary with 1-click Save to Insights */}
          {dashboard.executiveInsights && dashboard.executiveInsights.length > 0 && (
            <Card className="border border-border bg-card/90 p-5 shadow-sm">
              <CardHeader className="space-y-1 p-0 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="size-4" />
                    <CardTitle className="text-sm font-semibold">Executive Highlights</CardTitle>
                  </div>
                  <Link to="/dashboard/analytics">
                    <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary">
                      Explore Deep Analytics &rarr;
                    </Button>
                  </Link>
                </div>
                <CardDescription className="text-xs">
                  Automated strategic takeaways computed directly from {dashboard.sheetName || selectedSheet}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 pt-1">
                  {dashboard.executiveInsights.map((insight, idx) => {
                    const isSaved = savedBulletIndexes.has(idx);
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-border bg-muted/40 p-3 text-xs leading-relaxed text-foreground flex flex-col justify-between gap-2"
                      >
                        <div>
                          <span className="font-semibold text-primary mr-1.5">•</span>
                          {insight}
                        </div>
                        <div className="flex justify-end pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSaved}
                            onClick={() => handleSaveInsight(insight, idx)}
                            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                          >
                            {isSaved ? (
                              <>
                                <Check className="size-3 text-emerald-500" />
                                Saved to Insights
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="size-3 text-primary" />
                                Save Insight
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revenue Trend Chart & Top Contributors */}
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
                    <CardTitle className="text-base font-semibold">Top Contributors</CardTitle>
                  </div>
                  <Badge variant="secondary">{productBreakdown.length} items</Badge>
                </div>
                <CardDescription>Primary revenue drivers in this sheet</CardDescription>
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

                <div className="pt-2 flex gap-2">
                  <Link to="/dashboard/analytics" className="flex-1">
                    <Button variant="default" size="sm" className="w-full text-xs">
                      Deep Dive Analytics
                    </Button>
                  </Link>
                  <Link to="/dashboard/ai-chat" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs inline-flex items-center justify-center gap-1.5">
                      <Sparkles className="size-3.5" />
                      Ask AI Analyst
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Insights & Reports Dual Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Saved Insights */}
            <Card className="border border-border bg-card/90 shadow-sm">
              <CardHeader className="space-y-1 p-5 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <Bookmark className="size-4" />
                    <CardTitle className="text-base font-semibold">Saved Insights</CardTitle>
                  </div>
                  <Link to="/dashboard/insights">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View all ({recentInsights.length})
                    </Button>
                  </Link>
                </div>
                <CardDescription className="text-xs">
                  Your curated library of discoveries and strategic observations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {recentInsights.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    No insights saved yet. Click "Save Insight" on any highlight above or in AI Chat.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {recentInsights.map((ins) => (
                      <div key={ins.id} className="py-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-foreground truncate">{ins.title}</p>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {ins.category}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{ins.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Generated Reports */}
            <Card className="border border-border bg-card/90 shadow-sm">
              <CardHeader className="space-y-1 p-5 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <FileText className="size-4" />
                    <CardTitle className="text-base font-semibold">Executive Reports</CardTitle>
                  </div>
                  <Link to="/dashboard/reports">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View all ({recentReports.length})
                    </Button>
                  </Link>
                </div>
                <CardDescription className="text-xs">
                  Generated strategic reports with exportable Markdown downloads
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {recentReports.length === 0 ? (
                  <div className="py-2 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      No reports generated yet. Export a full strategic audit for this dataset.
                    </p>
                    <Link to="/dashboard/reports">
                      <Button variant="outline" size="sm" className="text-xs inline-flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        Generate Executive Report
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentReports.map((rep) => (
                      <div key={rep.id} className="py-2.5 flex items-center justify-between">
                        <div className="space-y-0.5 max-w-[240px]">
                          <p className="text-xs font-semibold text-foreground truncate">{rep.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{rep.datasetName} • {rep.sheetName}</p>
                        </div>
                        <Link to="/dashboard/reports">
                          <Button variant="ghost" size="sm" className="text-xs">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}