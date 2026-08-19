import { useMemo } from "react";
import type { AxiosError } from "axios";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { SectionHeader } from "@/components/common/SectionHeader";
import { FileUploadPanel } from "@/components/upload/FileUploadPanel";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

import { fetchDatasets, uploadDataset } from "@/services/datasets";
import type { DatasetMetadata } from "@/types";

export function UploadPage() {
  const queryClient = useQueryClient();

  const {
    data: datasets = [],
    isLoading,
  } = useQuery<DatasetMetadata[], Error>({
    queryKey: ["datasets"],
    queryFn: fetchDatasets,
  });

  const uploadMutation = useMutation<
    DatasetMetadata,
    AxiosError<{ message: string }>,
    File[]
  >({
    mutationFn: async (files) => {
      if (files.length === 0) {
        throw new Error("No file selected");
      }

      return uploadDataset(files);
    },

    onSuccess: () => {
      console.log("✅ Upload successful");

      queryClient.invalidateQueries({
        queryKey: ["datasets"],
      });
    },

    onError: (error) => {
      console.log("========== UPLOAD ERROR ==========");
      console.log("Status:", error.response?.status);
      console.log("Data:", error.response?.data);
      console.log(error);
      console.log("=================================");
    },
  });

  const datasetCount = datasets.length;

  const totalRows = useMemo(
    () => datasets.reduce((sum, dataset) => sum + dataset.rowCount, 0),
    [datasets]
  );

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Upload"
        description="Add new datasets and connect them to your analytics workflows."
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-6">
          <FileUploadPanel
            onUpload={(files) => uploadMutation.mutate(files)}
            uploading={uploadMutation.status === "pending"}
          />

          <Card className="border border-border bg-card/90 shadow-sm">
            <CardHeader className="space-y-2 p-6">
              <CardTitle>Dataset activity</CardTitle>

              <CardDescription>
                {datasetCount} dataset
                {datasetCount === 1 ? "" : "s"} available, {totalRows} rows
                indexed.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 border-t border-border p-6">
              {uploadMutation.isError && (
                <div className="rounded-2xl bg-red-100 p-4 text-red-700">
                  <strong>Upload failed</strong>

                  <p className="mt-2">
                    {uploadMutation.error.response?.data?.message ??
                      uploadMutation.error.message}
                  </p>
                </div>
              )}

              {uploadMutation.isSuccess && (
                <div className="rounded-2xl bg-green-100 p-4 text-green-700">
                  ✅ Dataset uploaded successfully.
                </div>
              )}

              <div>
                <p className="text-sm font-semibold">
                  Connected datasets
                </p>

                <p className="text-sm text-muted-foreground">
                  All uploads are stored and accessible from the AI workspace.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-border bg-card/90 shadow-sm">
          <CardHeader className="space-y-2 p-6">
            <CardTitle>Upload guidance</CardTitle>

            <CardDescription>
              We support CSV and Excel files.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 border-t border-border p-6">
            <div>
              <p className="font-semibold">Best formats</p>

              <p className="text-sm text-muted-foreground">
                CSV, XLSX with a header row.
              </p>
            </div>

            <div>
              <p className="font-semibold">Review files</p>

              <p className="text-sm text-muted-foreground">
                Uploaded files become available in AI Chat.
              </p>
            </div>

            <div>
              <p className="font-semibold">Team access</p>

              <p className="text-sm text-muted-foreground">
                Datasets belong to your account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle>Uploaded datasets</CardTitle>

          <CardDescription>
            Available across the application.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p>Loading datasets...</p>
          ) : datasets.length === 0 ? (
            <p>No uploaded datasets.</p>
          ) : (
            <div className="grid gap-3">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="rounded-xl border p-4"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {dataset.fileName}
                      </p>

                      <p className="font-semibold">
                        {dataset.name}
                      </p>
                    </div>

                    <Badge variant="secondary">
                      {dataset.rowCount} rows
                    </Badge>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {dataset.columnCount} columns •{" "}
                    {new Date(dataset.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}