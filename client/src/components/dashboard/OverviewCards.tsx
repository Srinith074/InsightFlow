import { motion } from "framer-motion"
import { overviewMetrics } from "@/services/dashboard"
import { StatsCard } from "@/components/common/StatsCard"

export function OverviewCards() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {overviewMetrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
        >
          <StatsCard metric={metric} />
        </motion.div>
      ))}
    </section>
  )
}
