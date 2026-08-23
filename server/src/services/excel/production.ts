import { filterByMonth } from "./date.js";
import { getNumericValue } from "../analytics.service.js";

export function productionByMonth(
  rows: Record<string, unknown>[],
  month?: string
) {
  const filtered = filterByMonth(rows, month);
  if (filtered.length === 0) {
    return {
      month: month || "Overall",
      production: 0,
      rowCount: 0,
    };
  }

  const columns = Object.keys(filtered[0] || {});
  const prodCol = columns.find((c) =>
    /production|produced|output|manufactured|units[\s_]?produced/i.test(c.trim())
  );

  let total = 0;

  if (prodCol) {
    filtered.forEach((row) => {
      total += getNumericValue(row[prodCol]);
    });
  } else {
    filtered.forEach((row) => {
      Object.entries(row).forEach(([key, value]) => {
        if (/production|produced|output|manufactured/i.test(key)) {
          total += getNumericValue(value);
        }
      });
    });
  }

  return {
    month: month || "Overall",
    production: total,
    rowCount: filtered.length,
  };
}