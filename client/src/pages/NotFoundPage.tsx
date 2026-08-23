import { Link } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

export function NotFoundPage() {
  useDocumentTitle("InsightFlow — Page Not Found")
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <Card className="w-full max-w-2xl border border-border bg-card/95 shadow-lg">
        <CardHeader className="p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 size-14 text-destructive" />
          <CardTitle className="text-4xl">Page not found</CardTitle>
          <CardDescription className="mx-auto mt-2 max-w-md text-base text-muted-foreground">
            The page you were looking for does not exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Link to="/">
            <Button>Return home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
