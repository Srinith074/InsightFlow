import { useEffect, useState } from "react";
import {
  fetchDashboard,
  type DashboardData,
} from "@/services/dashboard";
import { fetchDatasets } from "@/services/datasets";

import { SectionHeader } from "@/components/common/SectionHeader";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui";
import { BarChart3 } from "lucide-react";

export function DashboardHome() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        console.log("Loading datasets...");

        const datasets = await fetchDatasets();

        console.log("Datasets:", datasets);

        if (!datasets || datasets.length === 0) {
          console.warn("No datasets found.");
          setLoading(false);
          return;
        }

        const datasetId = datasets[0].id;

        console.log("Using Dataset:", datasetId);

        const dashboardData = await fetchDashboard(datasetId);

        console.log("Dashboard:", dashboardData);

        setDashboard(dashboardData);
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg font-semibold">
        Loading dashboard...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        No dashboard data found.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Home"
        description="Your analytics workspace for every dataset, insight, and AI conversation."
      />

      <OverviewCards dashboard={dashboard} />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border border-border bg-card/90 p-5 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <BarChart3 className="size-5" />
              <CardTitle className="text-lg">
                Dashboard Summary
              </CardTitle>
            </div>

            <CardDescription>
              Live analytics generated from your uploaded Excel dataset.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 pt-4">
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Total Revenue
              </p>
              <p className="text-2xl font-semibold">
                ₹{dashboard.totalRevenue.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Average Revenue
              </p>
              <p className="text-2xl font-semibold">
                ₹{Math.round(
                  dashboard.averageRevenue
                ).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Top Product
              </p>
              <p className="text-2xl font-semibold">
                {dashboard.topProduct}
              </p>
            </div>

            <Button className="w-full">
              Review Latest Insight
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}