import { filterByMonth } from "./date.js";

export function productionByMonth(
  rows: Record<string, unknown>[],
  month: string
) {
  const filtered = filterByMonth(rows, month);

  let total = 0;

  filtered.forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      if (
        key.toLowerCase().includes("production")
      ) {
        total += Number(value) || 0;
      }
    });
  });

  return {
    month,
    production: total,
  };
}