import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUploadIcon, FileSpreadsheet } from "lucide-react";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

interface FileUploadPanelProps {
  onUpload: (files: File[]) => void;
  uploading: boolean;
}

export function FileUploadPanel({ onUpload, uploading }: FileUploadPanelProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
  });

  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files);
      setFiles([]);
    }
  };

  return (
    <Card className="border border-border bg-card/90 shadow-sm">
      <CardHeader className="space-y-1 p-6 pb-4">
        <div className="flex items-center gap-2 text-foreground">
          <CloudUploadIcon className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">Upload Dataset</CardTitle>
        </div>
        <CardDescription>
          Drag and drop your spreadsheet or browse files for ingestion and deterministic analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div
          {...getRootProps()}
          className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed p-8 text-center transition ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:border-primary hover:bg-muted/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <FileSpreadsheet className="size-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isDragActive ? "Drop spreadsheet here..." : "Choose a file or drag & drop"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports CSV, XLS, and XLSX files (up to 25MB)
            </p>
          </div>
          <Button variant="secondary" size="sm" type="button" className="mt-2">
            Browse files
          </Button>
        </div>

        {files.length > 0 && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Selected File
              </p>
              <Badge variant="secondary">{files.length} file ready</Badge>
            </div>
            <div className="grid gap-2">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between rounded-2xl bg-muted/80 p-3 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileSpreadsheet className="size-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground truncate">{file.name}</span>
                  </div>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full h-10 rounded-2xl"
            >
              {uploading ? "Uploading and indexing..." : "Upload and Parse Dataset"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
