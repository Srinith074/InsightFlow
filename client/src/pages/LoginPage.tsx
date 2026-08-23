import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui"
import { useAuth } from "@/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  useDocumentTitle("InsightFlow — Sign In")
  const navigate = useNavigate()
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    await login(values)
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <Card className="w-full border border-border bg-card/95 p-8 shadow-lg">
          <div className="flex flex-col items-center text-center mb-6">
            <Link to="/">
              <img
                src="/branding/app-icon.png"
                alt="InsightFlow"
                className="size-16 rounded-2xl shadow-lg mb-3 object-contain hover:scale-105 transition duration-200"
              />
            </Link>
            <div className="text-xl font-bold tracking-tight text-foreground">
              InsightFlow
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deterministic Analytics & AI Intelligence
            </p>
          </div>
          <CardHeader className="space-y-2 p-0 text-center sm:text-left">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your InsightFlow workspace to continue.</CardDescription>
          </CardHeader>
          <CardContent className="mt-6 grid gap-5">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  Email address
                </label>
                <Input id="email" type="email" {...register("email")} placeholder="hello@company.com" />
                {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                  Password
                </label>
                <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
                {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
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
