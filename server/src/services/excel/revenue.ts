import { filterByMonth } from "./date";

export function revenueByMonth(
  rows: any[],
  month: string
) {
  const filtered = filterByMonth(rows, month);

  const total = filtered.reduce((sum, row) => {
    const revenue = Number(row["Total Revenue"]);

    return sum + (isNaN(revenue) ? 0 : revenue);
  }, 0);

  return {
    month,
    revenue: total,
  };
}