import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
} from "@/components/ui";
import { fetchDatasets, deleteDataset } from "@/services/datasets";
import type { DatasetMetadata } from "@/types";
import {
  Calendar,
  Database,
  FileSpreadsheet,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";

export function DatasetsPage() {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadDatasets() {
    try {
      setLoading(true);
      const data = await fetchDatasets();
      setDatasets(data);
    } catch (error) {
      console.error("Failed to load datasets:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDatasets();
  }, []);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Are you sure you want to permanently delete this dataset?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteDataset(id);
      setDatasets((prev) => prev.filter((dataset) => dataset.id !== id));
    } catch (error) {
      console.error("Failed to delete dataset:", error);
      alert("Failed to delete dataset. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

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
        description="Manage your uploaded Excel workbooks and CSV files."
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
                Upload your first spreadsheet to start analyzing data with deterministic KPIs and AI insights.
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

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Link to="/dashboard" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            View Overview
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}