import { useEffect, useState } from "react";

import { SectionHeader } from "@/components/common/SectionHeader";

import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
  Badge,
  Button,
} from "@/components/ui";

import {
  getDatasets,
  deleteDataset,
  type DatasetItem,
} from "@/services/files";

export function DatasetsPage() {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDatasets() {
    try {
      const data = await getDatasets();
      setDatasets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDatasets();
  }, []);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this dataset?"
    );

    if (!confirmed) return;

    try {
      await deleteDataset(id);

      setDatasets((prev) =>
        prev.filter((dataset) => dataset.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete dataset");
    }
  }

  if (loading) {
    return <div className="p-8">Loading datasets...</div>;
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Datasets"
        description="Manage uploaded datasets."
      />

      {datasets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            No datasets uploaded.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {datasets.map((dataset) => (
            <Card
              key={dataset.id}
              className="border border-border bg-card"
            >
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>{dataset.name}</CardTitle>

                  <Badge>Uploaded</Badge>
                </div>

                <CardDescription>
                  Excel Dataset
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Rows</span>
                  <span>{dataset.rowCount}</span>
                </div>

                <div className="flex justify-between">
                  <span>Columns</span>
                  <span>{dataset.columnCount}</span>
                </div>

                <div className="flex justify-between">
                  <span>Size</span>
                  <span>
                    {(dataset.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() =>
                    handleDelete(dataset.id)
                  }
                >
                  Delete Dataset
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}