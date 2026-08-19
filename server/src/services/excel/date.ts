export type ExcelRow = Record<string, unknown>;

export function filterByMonth(
  rows: ExcelRow[],
  month: string
): ExcelRow[] {
  return rows.filter((row) => {
    const dateValue =
      row["Date"] ??
      row["date"] ??
      row["DATE"];

    if (dateValue === undefined || dateValue === null) {
      return false;
    }

    const date = new Date(String(dateValue));

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const rowMonth = date.toLocaleString("en-US", {
      month: "long",
    });

    return (
      rowMonth.toLowerCase() === month.toLowerCase()
    );
  });
}
