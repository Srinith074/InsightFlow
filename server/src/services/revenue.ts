export function totalRevenue(rows: any[]) {
  return rows.reduce(
    (sum, row) => sum + Number(row["Total Revenue"] || 0),
    0
  );
}

export function averageRevenue(rows: any[]) {
  if (!rows.length) {
    return 0;
  }

  return (
    totalRevenue(rows) /
    rows.length
  );
}

export function highestRevenue(rows: any[]) {
  return Math.max(
    ...rows.map((r) => Number(r["Total Revenue"] || 0))
  );
}

export function lowestRevenue(rows: any[]) {
  return Math.min(
    ...rows.map((r) => Number(r["Total Revenue"] || 0))
  );
}