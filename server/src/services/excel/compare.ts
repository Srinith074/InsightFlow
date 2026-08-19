import { revenueByMonth } from "./revenue";

export function compareRevenue(
  rows: any[],
  month1: string,
  month2: string
) {
  const first = revenueByMonth(rows, month1);
  const second = revenueByMonth(rows, month2);

  return {
    month1,
    revenue1: first.revenue,
    month2,
    revenue2: second.revenue,
    difference:
      second.revenue - first.revenue,
  };
}