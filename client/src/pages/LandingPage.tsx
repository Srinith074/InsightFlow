import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Cpu, Layers, Sparkles } from "lucide-react"
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui"
import { brandName, productTagline } from "@/assets"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto grid min-h-screen max-w-7xl gap-16 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <Sparkles className="size-4" /> Premium SaaS analytics
              </p>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="max-w-3xl text-5xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-6xl">
              {brandName} helps teams build insight-driven products with intuitive analytics and AI workflows.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="max-w-2xl text-lg leading-8 text-muted-foreground">
              {productTagline} Centralize datasets, share strategic reports, and collaborate with AI-powered insights in a polished workspace.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col gap-4 sm:flex-row">
              <Link to="/register">
                <Button className="min-w-40">Start free trial</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="min-w-40 inline-flex items-center justify-center gap-2">
                  View demo
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="grid gap-4">
            <Card className="border border-border bg-card/90 p-6 shadow-lg">
              <CardHeader className="space-y-3 p-0">
                <CardTitle className="text-xl text-foreground">Growth pulse</CardTitle>
                <CardDescription>Monitor revenue, retention, and AI adoption from one central workspace.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 pt-4">
                <div className="grid gap-2 rounded-3xl bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Revenue forecast</p>
                  <p className="text-3xl font-semibold text-foreground">$124.8k</p>
                </div>
                <div className="grid gap-2 rounded-3xl bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Active datasets</p>
                  <p className="text-3xl font-semibold text-foreground">82 live sources</p>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Layers, title: "Unified stack", description: "Connect data, AI, and reporting without friction." },
                { icon: Cpu, title: "Smart operations", description: "Automated workflows that keep teams aligned." },
              ].map((item) => (
                <Card key={item.title} className="border border-border bg-card/90 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <item.icon className="size-6 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        </section>
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="border border-border bg-card/90 p-6 shadow-sm">
            <CardHeader className="space-y-3 p-0">
              <CardTitle>Trusted by product teams</CardTitle>
              <CardDescription>Built for modern growth teams and data-driven partnerships.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border border-border bg-card/90 p-6 shadow-sm">
            <CardHeader className="space-y-3 p-0">
              <CardTitle>Secure by design</CardTitle>
              <CardDescription>Role access, audit tracking, and encrypted pipelines keep teams compliant.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border border-border bg-card/90 p-6 shadow-sm">
            <CardHeader className="space-y-3 p-0">
              <CardTitle>AI assistant</CardTitle>
              <CardDescription>Ask questions, generate reports, and derive recommendations instantly.</CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>
    </div>
  )
}
