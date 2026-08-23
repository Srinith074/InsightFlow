import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Database,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

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
import {
  fetchReports,
  fetchReportById,
  createReport,
  deleteReport,
  downloadReportFile,
  type SavedReport,
} from "@/services/reports";
import type { DatasetMetadata } from "@/types";

export function ReportsPage() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [selectedDatasetFilter, setSelectedDatasetFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Generate Report Modal State
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [targetDatasetId, setTargetDatasetId] = useState("");
  const [targetSheet, setTargetSheet] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [generating, setGenerating] = useState(false);

  // View Report Modal State
  const [viewingReport, setViewingReport] = useState<SavedReport | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [reportsData, datasetsData] = await Promise.all([
          fetchReports(selectedDatasetFilter === "all" ? undefined : selectedDatasetFilter),
          fetchDatasets(),
        ]);
        if (isMounted) {
          setReports(reportsData);
          setDatasets(datasetsData);

          if (datasetsData.length > 0 && !targetDatasetId) {
            setTargetDatasetId(datasetsData[0].id);
            const firstSheet = datasetsData[0].sheetNames?.[0] || datasetsData[0].selectedSheet || "";
            setTargetSheet(firstSheet);
          }
        }
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedDatasetFilter, targetDatasetId]);

  const handleDatasetSelectForGenerate = (id: string) => {
    setTargetDatasetId(id);
    const d = datasets.find((item) => item.id === id);
    const sheet = d?.sheetNames?.[0] || d?.selectedSheet || "";
    setTargetSheet(sheet);
  };

  const handleGenerateReport = async () => {
    if (!targetDatasetId) return;
    try {
      setGenerating(true);
      const newReport = await createReport({
        datasetId: targetDatasetId,
        sheetName: targetSheet || undefined,
        title: customTitle.trim() || undefined,
      });
      setReports((prev) => [newReport, ...prev]);
      setIsGenerateOpen(false);
      setCustomTitle("");
      setViewingReport(newReport);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleViewReport = async (id: string) => {
    try {
      const fullReport = await fetchReportById(id);
      setViewingReport(fullReport);
    } catch (error) {
      console.error("Failed to load full report:", error);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (viewingReport?.id === id) {
        setViewingReport(null);
      }
    } catch (error) {
      console.error("Failed to delete report:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (report: SavedReport) => {
    try {
      await downloadReportFile(report.id, report.title);
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.datasetName.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q)
    );
  });

  const selectedDatasetObj = datasets.find((d) => d.id === targetDatasetId);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Executive Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate, view, and export comprehensive strategic reports from any spreadsheet with 1-click downloads.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsGenerateOpen(true)}
          disabled={datasets.length === 0}
          className="inline-flex items-center gap-1.5 text-xs"
        >
          <Plus className="size-3.5" />
          Generate New Report
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-border bg-card/90 shadow-sm">
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search generated reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="size-3.5 text-muted-foreground ml-2" />
              <select
                value={selectedDatasetFilter}
                onChange={(e) => setSelectedDatasetFilter(e.target.value)}
                className="h-9 cursor-pointer rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Datasets ({datasets.length})</option>
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Badge variant="secondary" className="text-xs self-start sm:self-auto">
            {filteredReports.length} Generated Reports
          </Badge>
        </CardContent>
      </Card>

      {/* Reports Content List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Loading reports workspace...
        </div>
      ) : filteredReports.length === 0 ? (
        <Card className="border-dashed border-border bg-card/50 p-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <FileText className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground">No reports generated yet</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Generate your first comprehensive executive report containing deterministic KPIs, top driver rankings, AI insights, and data quality scores.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsGenerateOpen(true)}
              disabled={datasets.length === 0}
              className="mt-2 inline-flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Generate First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="border border-border bg-card shadow-sm flex flex-col justify-between">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <CardTitle className="text-base font-semibold text-foreground line-clamp-2">
                      {report.title}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    Quality: {report.dataQualitySummary?.qualityScore ?? 100}%
                  </Badge>
                </div>
                <CardDescription className="text-xs line-clamp-2 pt-1">
                  {report.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                {/* Source Tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-md">
                    <Database className="size-3 text-primary" />
                    {report.datasetName}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-md">
                    <FileSpreadsheet className="size-3 text-primary" />
                    {report.sheetName}
                  </span>
                </div>

                {/* KPI Strip */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                  {report.kpis?.slice(0, 2).map((kpi, idx) => (
                    <div key={idx} className="bg-muted/30 p-2 rounded-xl">
                      <p className="text-[10px] text-muted-foreground truncate">{kpi.label}</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{kpi.value}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 text-xs inline-flex items-center justify-center gap-1"
                    onClick={() => handleViewReport(report.id)}
                  >
                    <Eye className="size-3.5" />
                    View Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs inline-flex items-center justify-center gap-1"
                    onClick={() => handleDownload(report)}
                  >
                    <Download className="size-3.5" />
                    Export
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={deletingId === report.id}
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* GENERATE REPORT MODAL */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md border border-border bg-card shadow-2xl">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Generate Strategic Report</CardTitle>
                <Button variant="ghost" size="icon-sm" onClick={() => setIsGenerateOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <CardDescription className="text-xs">
                Creates a comprehensive executive document from the chosen spreadsheet.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Select Source Dataset</label>
                <select
                  value={targetDatasetId}
                  onChange={(e) => handleDatasetSelectForGenerate(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                >
                  {datasets.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.rowCount} rows)
                    </option>
                  ))}
                </select>
              </div>

              {selectedDatasetObj?.sheetNames && selectedDatasetObj.sheetNames.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Select Sheet</label>
                  <select
                    value={targetSheet}
                    onChange={(e) => setTargetSheet(e.target.value)}
                    className="h-9 w-full cursor-pointer rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                  >
                    {selectedDatasetObj.sheetNames.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Custom Report Title (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. Q3 Sales & Performance Audit"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setIsGenerateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={generating || !targetDatasetId}
                  onClick={handleGenerateReport}
                  className="flex-1 text-xs inline-flex items-center justify-center gap-1.5"
                >
                  {generating ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FULL REPORT VIEWER MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
          <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col border border-border bg-card shadow-2xl">
            <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    Quality Score: {viewingReport.dataQualitySummary?.qualityScore ?? 100}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(viewingReport.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {viewingReport.title}
                </CardTitle>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownload(viewingReport)}
                  className="text-xs inline-flex items-center gap-1.5"
                >
                  <Download className="size-3.5" />
                  Download .MD
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setViewingReport(null)}>
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 overflow-y-auto space-y-6">
              {/* Executive Summary */}
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Executive Summary
                </h3>
                <p className="text-xs leading-relaxed text-foreground">{viewingReport.summary}</p>
              </div>

              {/* KPI Indicators */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {viewingReport.kpis?.map((kpi, idx) => (
                  <div key={idx} className="rounded-2xl border border-border bg-muted/40 p-3">
                    <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                    <p className="text-base font-bold text-foreground mt-1">{kpi.value}</p>
                    {kpi.subtitle && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.subtitle}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Automated Insights */}
              {viewingReport.insights && viewingReport.insights.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary" />
                    Automated Insights
                  </h3>
                  <div className="space-y-1.5">
                    {viewingReport.insights.map((ins, idx) => (
                      <div key={idx} className="rounded-xl border border-border bg-muted/20 p-2.5 text-xs text-foreground">
                        <span className="font-semibold text-primary mr-1.5">•</span>
                        {ins}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Contributors Table */}
              {viewingReport.topPerformers && viewingReport.topPerformers.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Top Contributors
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver / Item</TableHead>
                        <TableHead className="text-right">Contribution</TableHead>
                        <TableHead className="text-right">Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingReport.topPerformers.map((p, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-foreground text-xs">{p.name}</TableCell>
                          <TableCell className="text-right font-bold text-xs">{p.value}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">{p.share || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Data Quality Report */}
              {viewingReport.dataQualitySummary && (
                <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Data Quality Diagnostics
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {viewingReport.dataQualitySummary.totalRows.toLocaleString()} Rows Checked
                    </Badge>
                  </div>
                  {viewingReport.dataQualitySummary.warnings.length === 0 ? (
                    <p className="text-xs text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5" />
                      All records passed data quality and type consistency checks.
                    </p>
                  ) : (
                    <div className="space-y-1 pt-1">
                      {viewingReport.dataQualitySummary.warnings.map((w, idx) => (
                        <p key={idx} className="text-xs text-amber-500 flex items-center gap-1.5">
                          ⚠️ {w}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
