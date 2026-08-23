import { getMonthName } from "../analytics.service.js";

export type ExcelRow = Record<string, unknown>;

export function filterByMonth(
  rows: ExcelRow[],
  month?: string
): ExcelRow[] {
  if (!month || month.trim().toLowerCase() === "all" || month.trim().toLowerCase() === "total") {
    return rows;
  }

  const targetMonth = month.trim().toLowerCase();

  return rows.filter((row) => {
    // Check any date-like property on the row
    for (const [key, value] of Object.entries(row)) {
      if (/^(date|timestamp|time|day|order_date|transaction_date|month)$/i.test(key.trim()) || /date/i.test(key.trim())) {
        const rowMonth = getMonthName(value);
        if (rowMonth && (rowMonth.toLowerCase() === targetMonth || rowMonth.slice(0, 3).toLowerCase() === targetMonth.slice(0, 3))) {
          return true;
        }
      }
    }

    // Fallback: check if the value itself of any cell contains the month name
    for (const value of Object.values(row)) {
      const rowMonth = getMonthName(value);
      if (rowMonth && (rowMonth.toLowerCase() === targetMonth || rowMonth.slice(0, 3).toLowerCase() === targetMonth.slice(0, 3))) {
        return true;
      }
    }

    return false;
  });
}
