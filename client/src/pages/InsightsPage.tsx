import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Calendar,
  Database,
  Edit2,
  FileSpreadsheet,
  Filter,
  Search,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { fetchDatasets } from "@/services/datasets";
import {
  fetchInsights,
  deleteSavedInsight,
  updateSavedInsight,
  type SavedInsight,
} from "@/services/insights";
import type { DatasetMetadata } from "@/types";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function InsightsPage() {
  useDocumentTitle("InsightFlow — Saved Insights");
  const [insights, setInsights] = useState<SavedInsight[]>([]);
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [selectedDatasetFilter, setSelectedDatasetFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [insightsData, datasetsData] = await Promise.all([
          fetchInsights(selectedDatasetFilter === "all" ? undefined : selectedDatasetFilter),
          fetchDatasets(),
        ]);
        if (isMounted) {
          setInsights(insightsData);
          setDatasets(datasetsData);
        }
      } catch (error) {
        console.error("Failed to load insights:", error);
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
  }, [selectedDatasetFilter]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteSavedInsight(id);
      setInsights((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete insight:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (insight: SavedInsight) => {
    setEditingId(insight.id);
    setEditTitle(insight.title);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    try {
      const updated = await updateSavedInsight(id, { title: editTitle.trim() });
      setInsights((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update insight:", error);
    }
  };

  const filteredInsights = insights.filter((ins) => {
    const q = searchQuery.toLowerCase();
    return (
      ins.title.toLowerCase().includes(q) ||
      ins.content.toLowerCase().includes(q) ||
      ins.datasetName.toLowerCase().includes(q) ||
      ins.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Saved Insights
          </h1>
          <p className="text-sm text-muted-foreground">
            Your personalized library of saved discoveries, automated takeaways, and strategic AI evidence.
          </p>
        </div>

        <Link to="/dashboard/ai-chat">
          <Button size="sm" className="inline-flex items-center gap-1.5 text-xs">
            <Sparkles className="size-3.5" />
            Discover New Insights
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-border bg-card/90 shadow-sm">
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search saved insights..."
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
            {filteredInsights.length} Saved Insights
          </Badge>
        </CardContent>
      </Card>

      {/* Insights Content Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Loading your saved insights library...
        </div>
      ) : filteredInsights.length === 0 ? (
        <Card className="border-dashed border-border bg-card/50 p-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-0">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Bookmark className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground">
                {searchQuery || selectedDatasetFilter !== "all"
                  ? "No matching insights found"
                  : "No saved insights yet"}
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Bookmark key financial trends, Pareto driver summaries, or AI takeaways from the Overview or AI Analyst pages to curate your executive library.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  View Overview
                </Button>
              </Link>
              <Link to="/dashboard/ai-chat">
                <Button size="sm" className="inline-flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  Ask AI Analyst
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredInsights.map((insight) => (
            <Card key={insight.id} className="border border-border bg-card shadow-sm flex flex-col justify-between">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  {editingId === insight.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button size="sm" className="h-8 px-2 text-xs" onClick={() => handleSaveEdit(insight.id)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize text-[10px]">
                          <Tag className="size-2.5 mr-1" />
                          {insight.category}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(insight.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-base font-semibold text-foreground pt-1">
                        {insight.title}
                      </CardTitle>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleStartEdit(insight)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={deletingId === insight.id}
                      onClick={() => handleDelete(insight.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3">
                <p className="text-xs leading-relaxed text-foreground/90 bg-muted/30 p-3 rounded-xl">
                  {insight.content}
                </p>

                {/* Evidence Box if present */}
                {insight.evidence && (
                  <div className="rounded-xl border border-border/80 bg-muted/50 p-3 text-xs space-y-1.5">
                    <p className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                      <TrendingUp className="size-3 text-primary" />
                      Calculated Evidence:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {insight.evidence.metric && (
                        <div>
                          <span className="text-muted-foreground">Metric: </span>
                          <span className="font-medium text-foreground">{insight.evidence.metric}</span>
                        </div>
                      )}
                      {insight.evidence.current !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Value: </span>
                          <span className="font-medium text-foreground">{String(insight.evidence.current)}</span>
                        </div>
                      )}
                      {insight.evidence.delta !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Delta: </span>
                          <span className="font-medium text-primary">{String(insight.evidence.delta)}</span>
                        </div>
                      )}
                      {insight.evidence.details && (
                        <div className="col-span-2 text-muted-foreground">
                          {insight.evidence.details}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Source Dataset Metadata Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-md">
                    <Database className="size-3 text-primary" />
                    {insight.datasetName}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-md">
                    <FileSpreadsheet className="size-3 text-primary" />
                    {insight.sheetName}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
