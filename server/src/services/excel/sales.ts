import { filterByMonth } from "./date";

export function totalSales(
  rows: any[],
  month: string
) {
  const filtered = filterByMonth(rows, month);

  let total = 0;

  filtered.forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      if (
        key.includes("Plate") ||
        key.includes("Bowl") ||
        key.includes("Cup")
      ) {
        total += Number(value) || 0;
      }
    });
  });

  return {
    month,
    sales: total,
  };
}