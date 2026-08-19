import { getMonthYear } from "./date.js";

export function filterRows(
  rows: any[],
  month?: number,
  year?: number
) {
  if (!month && !year) {
    return rows;
  }

  return rows.filter((row) => {
    const info = getMonthYear(row.Date);

    if (!info) {
      return false;
    }

    if (month && info.month !== month) {
      return false;
    }

    if (year && info.year !== year) {
      return false;
    }

    return true;
  });
}