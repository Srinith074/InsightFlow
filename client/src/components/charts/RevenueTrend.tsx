import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { ChartPoint } from "@/types"

interface RevenueTrendProps {
  data: ChartPoint[]
}

export function RevenueTrend({ data }: RevenueTrendProps) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Revenue stream</p>
          <h3 className="text-xl font-semibold text-foreground">Monthly forecast</h3>
        </div>
        <p className="text-sm text-muted-foreground">Stable growth across platforms</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} opacity={0.4} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)" }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)" }} />
          <Tooltip contentStyle={{ backgroundColor: "var(--color-popover)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }} />
          <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fill="url(#revenueGradient)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
