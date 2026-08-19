import { Badge } from "@/components/ui";

interface Metric {
  label: string;
  value: string;
  change: string;
}

interface Props {
  metric: Metric;
}

export function StatsCard({ metric }: Props) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {metric.label}
        </p>

        <Badge variant="secondary">
          {metric.change}
        </Badge>
      </div>

      <h2 className="mt-4 text-4xl font-bold">
        {metric.value}
      </h2>
    </div>
  );
}