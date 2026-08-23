import { filterByMonth } from "./date.js";
import { getNumericValue } from "../analytics.service.js";

function getRowRevenue(row: Record<string, unknown>, columns: string[]): number {
  const revCol = columns.find((c) =>
    /^(total[\s_]?revenue|revenue|sales[\s_]?amount|total[\s_]?sales|amount|total|price)$/i.test(c.trim())
  );

  if (revCol && row[revCol] !== undefined) {
    return getNumericValue(row[revCol]);
  }

  // Otherwise sum numeric non-date columns
  let sum = 0;
  columns.forEach((c) => {
    if (/^(date|timestamp|time|day|month|product|item|category|name)$/i.test(c.trim())) return;
    const val = getNumericValue(row[c]);
    sum += val;
  });
  return sum;
}

export function revenueByMonth(
  rows: Record<string, unknown>[],
  month?: string
) {
  const filtered = filterByMonth(rows, month);
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  const total = filtered.reduce((sum, row) => {
    return sum + getRowRevenue(row, columns);
  }, 0);

  const average = filtered.length > 0 ? total / filtered.length : 0;

  return {
    month: month || "Overall",
    revenue: total,
    averageRevenue: average,
    rowCount: filtered.length,
  };
}

export function revenueStats(
  rows: Record<string, unknown>[],
  month?: string
) {
  const filtered = filterByMonth(rows, month);
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  if (filtered.length === 0) {
    return {
      month: month || "Overall",
      totalRevenue: 0,
      averageRevenue: 0,
      highestRevenue: 0,
      lowestRevenue: 0,
      rowCount: 0,
    };
  }

  const revenues = filtered.map((row) => getRowRevenue(row, columns));
  const total = revenues.reduce((a, b) => a + b, 0);
  const highest = Math.max(...revenues);
  const lowest = Math.min(...revenues);

  return {
    month: month || "Overall",
    totalRevenue: total,
    averageRevenue: total / filtered.length,
    highestRevenue: highest,
    lowestRevenue: lowest,
    rowCount: filtered.length,
  };
}