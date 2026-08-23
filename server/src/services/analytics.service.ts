export const MONTHS = [
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

export function getMonthName(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;

  let date: Date | null = null;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number") {
    // Excel serial date format
    if (value > 0 && value < 100000) {
      date = new Date(Math.round((value - 25569) * 86400 * 1000));
    } else {
      date = new Date(value);
    }
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    // Check if standard month name string e.g. "May", "May 2024", "2024-05"
    for (let i = 0; i < MONTHS.length; i++) {
      if (new RegExp(`\\b${MONTHS[i]}\\b`, "i").test(trimmed) || new RegExp(`\\b${MONTHS[i].slice(0, 3)}\\b`, "i").test(trimmed)) {
        return MONTHS[i];
      }
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      date = parsed;
    }
  }

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return MONTHS[date.getMonth()];
}

export function getNumericValue(value: unknown): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return Number.isNaN(value) ? 0 : value;

  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

export interface DashboardCalculationResult {
  totalRows: number;
  totalRevenue: number;
  averageRevenue: number;
  topProduct: string;
  topProductSales: number;
  productSales: Record<string, number>;
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
  headers: string[];
  columnCount: number;
}

export function calculateDashboard(rows: Record<string, unknown>[]): DashboardCalculationResult {
  const totalRows = rows.length;
  if (totalRows === 0) {
    return {
      totalRows: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      topProduct: "N/A",
      topProductSales: 0,
      productSales: {},
      monthlyRevenue: [],
      headers: [],
      columnCount: 0,
    };
  }

  const columns = Object.keys(rows[0] || {});
  const headers = columns;
  const columnCount = columns.length;

  // Detect key columns
  const dateCol = columns.find((c) =>
    /^(date|timestamp|time|day|order_date|transaction_date|month)$/i.test(c.trim())
  ) || columns.find((c) => /date|time/i.test(c.trim()));

  const revenueCol = columns.find((c) =>
    /^(total[\s_]?revenue|revenue|sales[\s_]?amount|total[\s_]?sales|amount|total|price)$/i.test(c.trim())
  );

  const productCol = columns.find((c) =>
    /^(product|product[\s_]?name|item|item[\s_]?name|sku|category)$/i.test(c.trim())
  );

  let totalRevenue = 0;
  const productSales: Record<string, number> = {};
  const monthlyRevenue: Record<string, number> = {};

  const isRowBased = Boolean(productCol && revenueCol && productCol !== revenueCol);

  if (isRowBased && productCol && revenueCol) {
    // Row-based: e.g. [Date, Product, Revenue, Quantity]
    rows.forEach((row) => {
      const prodName = String(row[productCol] ?? "Unknown").trim() || "Unknown";
      const rev = getNumericValue(row[revenueCol]);

      totalRevenue += rev;
      productSales[prodName] = (productSales[prodName] || 0) + rev;

      const month = dateCol ? getMonthName(row[dateCol]) : null;
      if (month) {
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + rev;
      }
    });
  } else {
    // Column-based: e.g. [Date, Plate, Bowl, Cup, Total Revenue] or pivot format
    rows.forEach((row) => {
      let rowRevenue = 0;

      if (revenueCol) {
        rowRevenue = getNumericValue(row[revenueCol]);
      }

      columns.forEach((column) => {
        if (column === dateCol || column === revenueCol) return;

        const val = getNumericValue(row[column]);
        if (val > 0) {
          productSales[column] = (productSales[column] || 0) + val;
          if (!revenueCol) {
            rowRevenue += val;
          }
        }
      });

      totalRevenue += rowRevenue;

      const month = dateCol ? getMonthName(row[dateCol]) : null;
      if (month) {
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + rowRevenue;
      }
    });
  }

  // Find top product
  let topProduct = "N/A";
  let topProductSales = 0;

  Object.entries(productSales).forEach(([prod, sales]) => {
    if (sales > topProductSales) {
      topProduct = prod;
      topProductSales = sales;
    }
  });

  const averageRevenue = totalRows > 0 ? totalRevenue / totalRows : 0;

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
    headers,
    columnCount,
  };
}