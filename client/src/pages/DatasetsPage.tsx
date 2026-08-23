import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  FileSpreadsheet,
  Search,
  SlidersHorizontal,
  TableProperties,
  Trash2,
  UploadCloud,
  X,
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
import {
  fetchDatasets,
  deleteDataset,
  fetchDatasetPreview,
  fetchDatasetSchema,
  type DatasetPreviewResponse,
  type DatasetSchemaResponse,
} from "@/services/datasets";
import type { DatasetMetadata } from "@/types";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function DatasetsPage() {
  useDocumentTitle("InsightFlow — Datasets");
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Preview Modal State
  const [previewDataset, setPreviewDataset] = useState<DatasetMetadata | null>(null);
  const [previewSheet, setPreviewSheet] = useState<string>("");
  const [previewData, setPreviewData] = useState<DatasetPreviewResponse | null>(null);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);

  // Schema & Quality Modal State
  const [schemaDataset, setSchemaDataset] = useState<DatasetMetadata | null>(null);
  const [schemaSheet, setSchemaSheet] = useState<string>("");
  const [schemaData, setSchemaData] = useState<DatasetSchemaResponse | null>(null);
  const [loadingSchema, setLoadingSchema] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await fetchDatasets();
        if (isMounted) {
          setDatasets(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load datasets:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Are you sure you want to permanently delete this dataset?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteDataset(id);
      setDatasets((prev) => prev.filter((dataset) => dataset.id !== id));
      if (previewDataset?.id === id) setPreviewDataset(null);
      if (schemaDataset?.id === id) setSchemaDataset(null);
    } catch (error) {
      console.error("Failed to delete dataset:", error);
      alert("Failed to delete dataset. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  // Load Preview Data
  const openPreview = async (dataset: DatasetMetadata) => {
    setPreviewDataset(dataset);
    const firstSheet = dataset.sheetNames?.[0] || dataset.selectedSheet || "";
    setPreviewSheet(firstSheet);
    setPreviewPage(1);
    await loadPreviewPage(dataset.id, firstSheet, 1);
  };

  const loadPreviewPage = async (datasetId: string, sheet: string, page: number) => {
    try {
      setLoadingPreview(true);
      const data = await fetchDatasetPreview(datasetId, sheet || undefined, page, 50);
      setPreviewData(data);
      setPreviewPage(page);
    } catch (error) {
      console.error("Failed to load dataset preview:", error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePreviewSheetChange = async (sheet: string) => {
    if (!previewDataset) return;
    setPreviewSheet(sheet);
    setPreviewPage(1);
    await loadPreviewPage(previewDataset.id, sheet, 1);
  };

  // Load Schema & Quality Data
  const openSchema = async (dataset: DatasetMetadata) => {
    setSchemaDataset(dataset);
    const firstSheet = dataset.sheetNames?.[0] || dataset.selectedSheet || "";
    setSchemaSheet(firstSheet);
    await loadSchemaData(dataset.id, firstSheet);
  };

  const loadSchemaData = async (datasetId: string, sheet: string) => {
    try {
      setLoadingSchema(true);
      const data = await fetchDatasetSchema(datasetId, sheet || undefined);
      setSchemaData(data);
    } catch (error) {
      console.error("Failed to load dataset schema:", error);
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleSchemaSheetChange = async (sheet: string) => {
    if (!schemaDataset) return;
    setSchemaSheet(sheet);
    await loadSchemaData(schemaDataset.id, sheet);
  };

  const filteredDatasets = datasets.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading dataset repository...
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Datasets"
        description="Inspect schema structures, preview raw records, and manage uploaded workbooks."
        action={
          <Link to="/dashboard/upload">
            <Button className="inline-flex items-center gap-2">
              <UploadCloud className="size-4" />
              Upload New Dataset
            </Button>
          </Link>
        }
      />

      {datasets.length === 0 ? (
        <Card className="border-dashed border-border bg-card/50 p-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Database className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground">No datasets available</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Upload your first spreadsheet to start analyzing data with deterministic KPIs, schema diagnostics, and AI insights.
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
      ) : (
        <>
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search datasets by name or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-2xl pl-10 text-sm"
            />
          </div>

          {filteredDatasets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No datasets matching "{searchQuery}".
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredDatasets.map((dataset) => {
                const sheets = dataset.sheetNames ?? [];
                const sizeKb = (dataset.size / 1024).toFixed(1);
                const isDeleting = deletingId === dataset.id;

                return (
                  <Card
                    key={dataset.id}
                    className="flex flex-col justify-between border border-border bg-card/90 shadow-sm transition hover:shadow-md"
                  >
                    <CardHeader className="space-y-2 p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 overflow-hidden">
                          <CardTitle className="truncate text-base font-semibold text-foreground">
                            {dataset.name}
                          </CardTitle>
                          <CardDescription className="truncate text-xs">
                            {dataset.fileName}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {dataset.mimeType.includes("csv") ? "CSV" : "Excel"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 p-5 pt-0">
                      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-3 text-xs">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Data Rows</p>
                          <p className="font-semibold text-foreground">{dataset.rowCount.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Columns</p>
                          <p className="font-semibold text-foreground">{dataset.columnCount}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">File Size</p>
                          <p className="font-semibold text-foreground">{sizeKb} KB</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Sheets</p>
                          <p className="font-semibold text-foreground">{sheets.length || 1}</p>
                        </div>
                      </div>

                      {sheets.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground">
                          <FileSpreadsheet className="size-3.5 shrink-0 text-primary" />
                          <span className="truncate">
                            {sheets.join(", ")}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3.5 shrink-0" />
                        <span>Uploaded {new Date(dataset.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPreview(dataset)}
                            className="flex-1 text-xs inline-flex items-center justify-center gap-1"
                          >
                            <Eye className="size-3.5" />
                            Preview Rows
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSchema(dataset)}
                            className="flex-1 text-xs inline-flex items-center justify-center gap-1"
                          >
                            <SlidersHorizontal className="size-3.5" />
                            Data Quality
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link to="/dashboard/analytics" className="flex-1">
                            <Button variant="default" size="sm" className="w-full text-xs inline-flex items-center justify-center gap-1">
                              <BarChart3 className="size-3.5" />
                              Deep Analytics
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => handleDelete(dataset.id)}
                            className="px-3"
                            title="Delete Dataset"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* PREVIEW ROWS MODAL */}
      {previewDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col border border-border bg-card shadow-2xl">
            <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {previewData?.totalRows.toLocaleString() || previewDataset.rowCount.toLocaleString()} Total Records
                  </Badge>
                  {previewData?.availableSheets && previewData.availableSheets.length > 1 && (
                    <select
                      value={previewSheet}
                      onChange={(e) => handlePreviewSheetChange(e.target.value)}
                      className="h-7 cursor-pointer rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none"
                    >
                      {previewData.availableSheets.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Dataset Preview: {previewDataset.name}
                </CardTitle>
              </div>

              <Button variant="ghost" size="icon-sm" onClick={() => setPreviewDataset(null)}>
                <X className="size-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-auto flex flex-col">
              {loadingPreview ? (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  Streaming records from persistent storage...
                </div>
              ) : !previewData || previewData.rows.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No records found in sheet "{previewSheet}".
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        {previewData.headers.map((h) => (
                          <TableHead key={h} className="whitespace-nowrap font-medium">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.rows.map((row, idx) => {
                        const rowNum = (previewPage - 1) * previewData.limit + idx + 1;
                        return (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs text-muted-foreground">{rowNum}</TableCell>
                            {previewData.headers.map((h) => (
                              <TableCell key={`${idx}-${h}`} className="text-xs text-foreground whitespace-nowrap">
                                {String(row[h] ?? "")}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination Controls */}
              {previewData && previewData.totalPages > 1 && (
                <div className="p-3 border-t border-border flex items-center justify-between bg-muted/20 shrink-0 text-xs">
                  <span className="text-muted-foreground">
                    Page {previewData.page} of {previewData.totalPages} ({previewData.totalRows.toLocaleString()} rows)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={previewPage <= 1 || loadingPreview}
                      onClick={() => loadPreviewPage(previewDataset.id, previewSheet, previewPage - 1)}
                      className="h-8 px-2 text-xs"
                    >
                      <ChevronLeft className="size-3.5 mr-1" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={previewPage >= previewData.totalPages || loadingPreview}
                      onClick={() => loadPreviewPage(previewDataset.id, previewSheet, previewPage + 1)}
                      className="h-8 px-2 text-xs"
                    >
                      Next
                      <ChevronRight className="size-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* SCHEMA & DATA QUALITY MODAL */}
      {schemaDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col border border-border bg-card shadow-2xl">
            <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    Domain: {schemaData?.schema.domain.toUpperCase() || "GENERAL"}
                  </Badge>
                  {schemaData?.availableSheets && schemaData.availableSheets.length > 1 && (
                    <select
                      value={schemaSheet}
                      onChange={(e) => handleSchemaSheetChange(e.target.value)}
                      className="h-7 cursor-pointer rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none"
                    >
                      {schemaData.availableSheets.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Schema & Data Quality: {schemaDataset.name}
                </CardTitle>
              </div>

              <Button variant="ghost" size="icon-sm" onClick={() => setSchemaDataset(null)}>
                <X className="size-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 overflow-y-auto space-y-6">
              {loadingSchema ? (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  Evaluating data quality and schema types...
                </div>
              ) : !schemaData ? (
                <div className="p-8 text-center text-muted-foreground">
                  No schema metadata available for sheet "{schemaSheet}".
                </div>
              ) : (
                <>
                  {/* Quality Overview Card */}
                  <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Data Quality Audit
                        </h4>
                        <p className="text-base font-bold text-foreground mt-0.5">
                          {schemaData.schema.quality.qualityScore}% Quality Score
                        </p>
                      </div>
                      <Badge
                        variant={schemaData.schema.quality.qualityScore >= 80 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {schemaData.schema.quality.totalRows.toLocaleString()} Rows Checked
                      </Badge>
                    </div>

                    {schemaData.schema.quality.warnings.length === 0 ? (
                      <p className="text-xs text-emerald-500 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        No missing values, invalid dates, or duplicate records detected.
                      </p>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        {schemaData.schema.quality.warnings.map((w, idx) => (
                          <p key={idx} className="text-xs text-amber-500 flex items-center gap-1.5">
                            ⚠️ {w}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Data Dictionary Table */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <TableProperties className="size-4" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                        Data Dictionary & Column Inferences
                      </h4>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Column Name</TableHead>
                          <TableHead>Detected Type</TableHead>
                          <TableHead className="text-right">Missing</TableHead>
                          <TableHead className="text-right">Unique Values</TableHead>
                          <TableHead>Sample Values</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schemaData.schema.columns.map((col) => (
                          <TableRow key={col.name}>
                            <TableCell className="font-medium text-foreground text-xs">{col.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-[10px]">
                                {col.inferredType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                              {col.nullCount}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">{col.distinctCount}</TableCell>
                            <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {col.sampleValues.join(", ") || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}