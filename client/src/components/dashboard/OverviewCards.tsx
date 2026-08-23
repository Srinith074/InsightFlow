import { motion } from "framer-motion";
import { StatsCard } from "@/components/common/StatsCard";
import type { DashboardData } from "@/services/dashboard";

interface Props {
  dashboard: DashboardData;
}

export function OverviewCards({ dashboard }: Props) {
  const metrics = [
    {
      label: "Total Revenue",
      value: `₹${dashboard.totalRevenue.toLocaleString("en-IN")}`,
      change: dashboard.growthRate !== null && dashboard.growthRate !== undefined
        ? `${dashboard.growthRate >= 0 ? "+" : ""}${dashboard.growthRate}% MoM`
        : "Live calculation",
    },
    {
      label: "Average Value / Order",
      value: `₹${Math.round(dashboard.averageRevenue).toLocaleString("en-IN")}`,
      change: `across ${dashboard.totalRows} records`,
    },
    {
      label: "Top Product Driver",
      value: dashboard.topProduct,
      change: dashboard.topProductShare
        ? `${dashboard.topProductShare}% share (₹${Math.round(dashboard.topProductSales).toLocaleString("en-IN")})`
        : `₹${Math.round(dashboard.topProductSales).toLocaleString("en-IN")}`,
    },
    {
      label: dashboard.bestPeriod ? "Peak Performing Period" : "Volume / Records",
      value: dashboard.bestPeriod
        ? dashboard.bestPeriod.period
        : `${dashboard.totalRows} entries`,
      change: dashboard.bestPeriod
        ? `₹${Math.round(dashboard.bestPeriod.revenue).toLocaleString("en-IN")}`
        : `${dashboard.totalQuantity ? `${dashboard.totalQuantity} units` : "Processed"}`,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.08,
          }}
        >
          <StatsCard metric={metric} />
        </motion.div>
      ))}
    </section>
  );
}