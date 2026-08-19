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
      change: "Live",
    },
    {
      label: "Average Revenue",
      value: `₹${Math.round(
        dashboard.averageRevenue
      ).toLocaleString("en-IN")}`,
      change: "Live",
    },
    {
      label: "Top Product",
      value: dashboard.topProduct,
      change: `${dashboard.topProductSales.toLocaleString("en-IN")}`,
    },
    {
      label: "Total Records",
      value: dashboard.totalRows.toString(),
      change: "Dataset",
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