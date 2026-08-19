    import { useCallback, useState } from "react"
    import { useDropzone } from "react-dropzone"
    import { CloudUploadIcon, FileTextIcon } from "lucide-react"
    import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"

    interface FileUploadPanelProps {
    onUpload: (files: File[]) => void
    uploading: boolean
    }

    export function FileUploadPanel({ onUpload, uploading }: FileUploadPanelProps) {
    const [files, setFiles] = useState<File[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((previousFiles) => [...previousFiles, ...acceptedFiles])
    }, [])

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { "*/*": [] } })

    const handleUpload = () => {
        if (files.length > 0) {
        onUpload(files)
        setFiles([])
        }
    }

    return (
        <Card className="border border-border bg-card/90 shadow-sm">
        <CardHeader className="space-y-2 px-4 pt-4">
            <div className="flex items-center gap-2 text-foreground">
            <CloudUploadIcon className="size-5" />
            <CardTitle className="text-base">Upload datasets</CardTitle>
            </div>
            <CardDescription>Drag files here or select documents for AI enrichment and dataset ingestion.</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
            <div
            {...getRootProps()}
            className="flex min-h-55 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-muted/30 p-8 text-center transition hover:border-primary"
            >
            <input {...getInputProps()} />
            <FileTextIcon className="size-10 text-muted-foreground" />
            <div>
                <p className="text-base font-medium text-foreground">Drop files here</p>
                <p className="text-sm text-muted-foreground">CSV, XLSX, or text extracts are supported.</p>
            </div>
            <Button variant="secondary">Select files</Button>
            </div>
            {files.length > 0 ? (
            <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Files ready to process</p>
                <Badge variant="secondary">{files.length} selected</Badge>
                </div>
                <div className="grid gap-2">
                {files.map((file) => (
                    <div key={file.name} className="rounded-2xl bg-muted p-3 text-sm text-foreground">
                    {file.name}
                    </div>
                ))}
                </div>
                <Button onClick={handleUpload} disabled={uploading} className="w-full">{uploading ? "Uploading..." : "Upload dataset"}</Button>
            </div>
            ) : null}
        </CardContent>
        </Card>
    )
    }
