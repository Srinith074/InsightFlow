const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getMonthName(value: any): string | null {
  let date: Date | null = null;

  // Already a Date object
  if (value instanceof Date) {
    date = value;
  }

  // Excel serial number
  else if (typeof value === "number") {
    date = new Date((value - 25569) * 86400 * 1000);
  }

  // Date string
  else if (typeof value === "string") {
    const parsed = new Date(value);

    if (!isNaN(parsed.getTime())) {
      date = parsed;
    }
  }

  if (!date || isNaN(date.getTime())) {
    return null;
  }

  return MONTHS[date.getMonth()];
}

function getNumericValue(value: any): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/[\d.]+/);

    if (match) {
      return Number(match[0]);
    }
  }

  return 0;
}

export function calculateDashboard(rows: any[]) {
  const totalRows = rows.length;

  let totalRevenue = 0;

  const productSales: Record<string, number> = {};
  const monthlyRevenue: Record<string, number> = {};

  if (rows.length > 0) {
    const columns = Object.keys(rows[0]);

    rows.forEach((row) => {
      let rowRevenue = 0;

      columns.forEach((column) => {
        if (column === "Date") return;

        const value = getNumericValue(row[column]);

        productSales[column] =
          (productSales[column] || 0) + value;

        rowRevenue += value;
      });

      totalRevenue += rowRevenue;

      const month = getMonthName(row.Date);

      if (month) {
        monthlyRevenue[month] =
          (monthlyRevenue[month] || 0) + rowRevenue;
      }
    });
  }

  let topProduct = "";
  let topProductSales = 0;

  Object.entries(productSales).forEach(([product, sales]) => {
    if (sales > topProductSales) {
      topProduct = product;
      topProductSales = sales;
    }
  });

  const averageRevenue =
    totalRows > 0 ? totalRevenue / totalRows : 0;

  const monthlyRevenueArray = MONTHS.filter(
    (month) => monthlyRevenue[month] !== undefined
  ).map((month) => ({
    month,
    revenue: monthlyRevenue[month],
  }));

  return {
    totalRows,
    totalRevenue,
    averageRevenue,
    topProduct,
    topProductSales,
    productSales,
    monthlyRevenue: monthlyRevenueArray,
  };
}