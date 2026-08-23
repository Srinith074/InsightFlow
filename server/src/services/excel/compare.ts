import { revenueByMonth } from "./revenue.js";

export function compareRevenue(
  rows: Record<string, unknown>[],
  month1: string,
  month2: string
) {
  const first = revenueByMonth(rows, month1);
  const second = revenueByMonth(rows, month2);

  const diff = second.revenue - first.revenue;
  const percentageChange = first.revenue > 0 ? (diff / first.revenue) * 100 : 0;

  return {
    month1,
    revenue1: first.revenue,
    month2,
    revenue2: second.revenue,
    difference: diff,
    percentageChange: Math.round(percentageChange * 100) / 100,
    higher: diff > 0 ? month2 : diff < 0 ? month1 : "Equal",
  };
}