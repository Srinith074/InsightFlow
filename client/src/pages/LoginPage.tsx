import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button } from "@/components/ui"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <Card className="w-full border border-border bg-card/95 p-8 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your InsightFlow workspace to continue.</CardDescription>
          </CardHeader>
          <CardContent className="mt-6 grid gap-5">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
                  Email address
                </label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="hello@company.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="password">
                  Password
                </label>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit">Sign in</Button>
            </form>
            <p className="text-sm text-muted-foreground">
              New to InsightFlow? <Link to="/register" className="text-primary underline">Create an account</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
