import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { Button, Card, CardContent, CardHeader, CardDescription, CardTitle, Input } from "@/components/ui"

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <Card className="w-full border border-border bg-card/95 p-8 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl">Forgot password</CardTitle>
            <CardDescription>Enter your email and we will send instructions to reset your password.</CardDescription>
          </CardHeader>
          <CardContent className="mt-6 grid gap-5">
            {sent ? (
              <div className="rounded-3xl bg-muted p-6 text-center">
                <p className="text-lg font-semibold text-foreground">Next step sent</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Check your inbox for a recovery link and follow the instructions to reset your password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
                    Email address
                  </label>
                  <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="hello@company.com" />
                </div>
                <Button type="submit">Send reset instructions</Button>
              </form>
            )}
            <p className="text-sm text-muted-foreground">
              Remembered your password? <Link to="/login" className="text-primary underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
