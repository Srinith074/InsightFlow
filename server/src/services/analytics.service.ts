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
      if (
        new RegExp(`\\b${MONTHS[i]}\\b`, "i").test(trimmed) ||
        new RegExp(`\\b${MONTHS[i].slice(0, 3)}\\b`, "i").test(trimmed)
      ) {
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

export interface DetectedSchema {
  dateColumn: string | null;
  revenueColumn: string | null;
  quantityColumn: string | null;
  productColumn: string | null;
  categoryColumn: string | null;
  regionColumn: string | null;
  numericColumns: string[];
  textColumns: string[];
}

export interface AnalyticsCapabilities {
  hasTimeDimension: boolean;
  hasProductDimension: boolean;
  hasCategoryDimension: boolean;
  hasQuantityDimension: boolean;
  hasRegionDimension: boolean;
}

export interface ProductMetric {
  name: string;
  revenue: number;
  quantity: number;
  transactions: number;
  share: number;
  avgPrice: number;
}

export interface CategoryMetric {
  name: string;
  revenue: number;
  quantity: number;
  transactions: number;
  share: number;
}

export interface RegionMetric {
  name: string;
  revenue: number;
  quantity: number;
  share: number;
}

export interface ColumnSummary {
  header: string;
  type: "numeric" | "categorical" | "date";
  distinctCount: number;
  sum?: number;
  avg?: number;
  min?: number | string;
  max?: number | string;
}

export interface DashboardCalculationResult {
  // Executive Overview Metrics
  totalRows: number;
  totalRevenue: number;
  averageRevenue: number;
  totalQuantity: number;
  topProduct: string;
  topProductSales: number;
  topProductShare: number;
  bestPeriod: { period: string; revenue: number } | null;
  growthRate: number | null;
  executiveInsights: string[];
  productSales: Record<string, number>;
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];

  // Deep Analytics Workspace Data
  detectedSchema: DetectedSchema;
  capabilities: AnalyticsCapabilities;
  timeSeries: {
    period: string;
    revenue: number;
    quantity: number;
    transactions: number;
    avgOrderValue: number;
  }[];
  timeStats: {
    minPeriod: string;
    minRevenue: number;
    maxPeriod: string;
    maxRevenue: number;
    avgPeriodRevenue: number;
  } | null;
  productAnalytics: {
    topProducts: ProductMetric[];
    bottomProducts: ProductMetric[];
    totalProducts: number;
  };
  categoryAnalytics: {
    categories: CategoryMetric[];
    topCategory: string | null;
  };
  regionalAnalytics: {
    regions: RegionMetric[];
  };
  quantityAnalytics: {
    totalQuantity: number;
    avgQuantityPerRow: number;
    highestVolumeProduct: string | null;
  } | null;
  columnSummaries: ColumnSummary[];
  sampleRows: Record<string, unknown>[];

  // Metadata
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
      totalQuantity: 0,
      topProduct: "N/A",
      topProductSales: 0,
      topProductShare: 0,
      bestPeriod: null,
      growthRate: null,
      executiveInsights: ["No data records found in this sheet."],
      productSales: {},
      monthlyRevenue: [],
      detectedSchema: {
        dateColumn: null,
        revenueColumn: null,
        quantityColumn: null,
        productColumn: null,
        categoryColumn: null,
        regionColumn: null,
        numericColumns: [],
        textColumns: [],
      },
      capabilities: {
        hasTimeDimension: false,
        hasProductDimension: false,
        hasCategoryDimension: false,
        hasQuantityDimension: false,
        hasRegionDimension: false,
      },
      timeSeries: [],
      timeStats: null,
      productAnalytics: { topProducts: [], bottomProducts: [], totalProducts: 0 },
      categoryAnalytics: { categories: [], topCategory: null },
      regionalAnalytics: { regions: [] },
      quantityAnalytics: null,
      columnSummaries: [],
      sampleRows: [],
      headers: [],
      columnCount: 0,
    };
  }

  const columns = Object.keys(rows[0] || {});
  const headers = columns;
  const columnCount = columns.length;

  // 1. Detect column roles with intelligent heuristics
  const dateCol =
    columns.find((c) => /^(date|timestamp|time|day|order_date|transaction_date|month|period)$/i.test(c.trim())) ||
    columns.find((c) => /date|time|period/i.test(c.trim())) ||
    null;

  const revenueCol =
    columns.find((c) =>
      /^(total[\s_]?revenue|revenue|sales[\s_]?amount|total[\s_]?sales|amount|total|price|cost|sales)$/i.test(
        c.trim()
      )
    ) || null;

  const quantityCol =
    columns.find((c) =>
      /^(qty|quantity|units|units[\s_]?sold|volume|count|pieces|items|amount_sold)$/i.test(c.trim())
    ) || null;

  const productCol =
    columns.find((c) =>
      /^(product|product[\s_]?name|item|item[\s_]?name|sku|material|description)$/i.test(c.trim())
    ) || null;

  const categoryCol =
    columns.find((c) =>
      /^(category|dept|department|segment|type|group|class|family)$/i.test(c.trim())
    ) || null;

  const regionCol =
    columns.find((c) =>
      /^(region|country|city|state|location|zone|territory|market)$/i.test(c.trim())
    ) || null;

  // Detect numeric vs text columns
  const numericColumns: string[] = [];
  const textColumns: string[] = [];

  columns.forEach((col) => {
    let numCount = 0;
    const sampleSize = Math.min(rows.length, 50);
    for (let i = 0; i < sampleSize; i++) {
      const val = rows[i]?.[col];
      if (typeof val === "number" || (!Number.isNaN(Number(val)) && val !== "" && val !== null && val !== undefined)) {
        numCount++;
      }
    }
    if (numCount >= sampleSize * 0.6) {
      numericColumns.push(col);
    } else {
      textColumns.push(col);
    }
  });

  // 2. Data aggregation across dimensions
  let totalRevenue = 0;
  let totalQuantity = 0;

  interface IntermediateItem {
    revenue: number;
    quantity: number;
    transactions: number;
  }

  const productMap = new Map<string, IntermediateItem>();
  const categoryMap = new Map<string, IntermediateItem>();
  const regionMap = new Map<string, IntermediateItem>();
  const periodMap = new Map<string, IntermediateItem>();

  const isRowBased = Boolean(productCol && revenueCol && productCol !== revenueCol);

  rows.forEach((row) => {
    let rowRevenue = 0;
    let rowQty = 0;

    if (quantityCol) {
      rowQty = getNumericValue(row[quantityCol]);
      totalQuantity += rowQty;
    }

    if (isRowBased && revenueCol) {
      rowRevenue = getNumericValue(row[revenueCol]);
      totalRevenue += rowRevenue;

      // Product
      if (productCol) {
        const prod = String(row[productCol] ?? "Unknown").trim() || "Unknown";
        const curr = productMap.get(prod) || { revenue: 0, quantity: 0, transactions: 0 };
        curr.revenue += rowRevenue;
        curr.quantity += rowQty;
        curr.transactions += 1;
        productMap.set(prod, curr);
      }
    } else {
      // Column-based format
      if (revenueCol) {
        rowRevenue = getNumericValue(row[revenueCol]);
      }

      columns.forEach((column) => {
        if (column === dateCol || column === revenueCol || column === quantityCol) return;

        const val = getNumericValue(row[column]);
        if (val > 0) {
          const curr = productMap.get(column) || { revenue: 0, quantity: 0, transactions: 0 };
          curr.revenue += val;
          curr.quantity += rowQty;
          curr.transactions += 1;
          productMap.set(column, curr);

          if (!revenueCol) {
            rowRevenue += val;
          }
        }
      });

      totalRevenue += rowRevenue;
    }

    // Category aggregation
    if (categoryCol) {
      const cat = String(row[categoryCol] ?? "Other").trim() || "Other";
      const curr = categoryMap.get(cat) || { revenue: 0, quantity: 0, transactions: 0 };
      curr.revenue += rowRevenue;
      curr.quantity += rowQty;
      curr.transactions += 1;
      categoryMap.set(cat, curr);
    }

    // Region aggregation
    if (regionCol) {
      const reg = String(row[regionCol] ?? "Global").trim() || "Global";
      const curr = regionMap.get(reg) || { revenue: 0, quantity: 0, transactions: 0 };
      curr.revenue += rowRevenue;
      curr.quantity += rowQty;
      curr.transactions += 1;
      regionMap.set(reg, curr);
    }

    // Date / Time aggregation
    if (dateCol) {
      const month = getMonthName(row[dateCol]);
      const periodKey = month || String(row[dateCol] ?? "N/A").trim();
      if (periodKey) {
        const curr = periodMap.get(periodKey) || { revenue: 0, quantity: 0, transactions: 0 };
        curr.revenue += rowRevenue;
        curr.quantity += rowQty;
        curr.transactions += 1;
        periodMap.set(periodKey, curr);
      }
    }
  });

  // 3. Transform Product Metrics
  const productAnalyticsList: ProductMetric[] = Array.from(productMap.entries())
    .map(([name, data]) => ({
      name,
      revenue: data.revenue,
      quantity: data.quantity,
      transactions: data.transactions,
      share: totalRevenue > 0 ? Number(((data.revenue / totalRevenue) * 100).toFixed(1)) : 0,
      avgPrice: data.quantity > 0 ? Number((data.revenue / data.quantity).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const topProducts = productAnalyticsList.slice(0, 10);
  const bottomProducts = productAnalyticsList.length > 5
    ? [...productAnalyticsList].reverse().slice(0, 5)
    : [];

  const topProduct = topProducts[0]?.name || "N/A";
  const topProductSales = topProducts[0]?.revenue || 0;
  const topProductShare = topProducts[0]?.share || 0;

  // Product sales map for backward compatibility
  const productSales: Record<string, number> = {};
  productAnalyticsList.forEach((p) => {
    productSales[p.name] = p.revenue;
  });

  // 4. Transform Category Metrics
  const categoryAnalyticsList: CategoryMetric[] = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      revenue: data.revenue,
      quantity: data.quantity,
      transactions: data.transactions,
      share: totalRevenue > 0 ? Number(((data.revenue / totalRevenue) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // 5. Transform Regional Metrics
  const regionalAnalyticsList: RegionMetric[] = Array.from(regionMap.entries())
    .map(([name, data]) => ({
      name,
      revenue: data.revenue,
      quantity: data.quantity,
      share: totalRevenue > 0 ? Number(((data.revenue / totalRevenue) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // 6. Transform Time Series
  let timeSeries: {
    period: string;
    revenue: number;
    quantity: number;
    transactions: number;
    avgOrderValue: number;
  }[] = [];

  // Sort months chronologically if matching standard months
  const standardMonthEntries = MONTHS.filter((m) => periodMap.has(m)).map((m) => {
    const data = periodMap.get(m)!;
    return {
      period: m,
      revenue: data.revenue,
      quantity: data.quantity,
      transactions: data.transactions,
      avgOrderValue: data.transactions > 0 ? Math.round(data.revenue / data.transactions) : 0,
    };
  });

  if (standardMonthEntries.length > 0) {
    timeSeries = standardMonthEntries;
  } else {
    timeSeries = Array.from(periodMap.entries()).map(([period, data]) => ({
      period,
      revenue: data.revenue,
      quantity: data.quantity,
      transactions: data.transactions,
      avgOrderValue: data.transactions > 0 ? Math.round(data.revenue / data.transactions) : 0,
    }));
  }

  const monthlyRevenue = timeSeries.map((t) => ({
    month: t.period,
    revenue: t.revenue,
  }));

  // Best period & growth rate
  let bestPeriod: { period: string; revenue: number } | null = null;
  let growthRate: number | null = null;
  let timeStats = null;

  if (timeSeries.length > 0) {
    let maxRev = -Infinity;
    let minRev = Infinity;
    let maxP = "";
    let minP = "";
    let sumRev = 0;

    timeSeries.forEach((t) => {
      sumRev += t.revenue;
      if (t.revenue > maxRev) {
        maxRev = t.revenue;
        maxP = t.period;
      }
      if (t.revenue < minRev) {
        minRev = t.revenue;
        minP = t.period;
      }
    });

    bestPeriod = { period: maxP, revenue: maxRev };
    timeStats = {
      minPeriod: minP,
      minRevenue: minRev,
      maxPeriod: maxP,
      maxRevenue: maxRev,
      avgPeriodRevenue: Math.round(sumRev / timeSeries.length),
    };

    if (timeSeries.length >= 2) {
      const prev = timeSeries[timeSeries.length - 2].revenue;
      const curr = timeSeries[timeSeries.length - 1].revenue;
      if (prev > 0) {
        growthRate = Number((((curr - prev) / prev) * 100).toFixed(1));
      }
    }
  }

  const averageRevenue = totalRows > 0 ? totalRevenue / totalRows : 0;

  // 7. Executive Insights Generator
  const executiveInsights: string[] = [];

  if (totalRevenue > 0) {
    executiveInsights.push(
      `Total generated revenue is ₹${Math.round(totalRevenue).toLocaleString("en-IN")} across ${totalRows.toLocaleString()} recorded transactions.`
    );
  }

  if (topProduct !== "N/A" && topProductSales > 0) {
    executiveInsights.push(
      `Primary revenue driver is "${topProduct}" generating ₹${Math.round(topProductSales).toLocaleString("en-IN")} (${topProductShare}% of total revenue).`
    );
  }

  if (bestPeriod && bestPeriod.revenue > 0) {
    executiveInsights.push(
      `Peak financial performance was recorded in ${bestPeriod.period} at ₹${Math.round(bestPeriod.revenue).toLocaleString("en-IN")}.`
    );
  }

  if (growthRate !== null) {
    const direction = growthRate >= 0 ? "expanded by" : "decreased by";
    executiveInsights.push(
      `Recent period trajectory ${direction} ${Math.abs(growthRate)}% compared to preceding interval.`
    );
  }

  if (totalQuantity > 0) {
    executiveInsights.push(
      `Total inventory/volume processed stands at ${Math.round(totalQuantity).toLocaleString("en-IN")} units.`
    );
  }

  if (executiveInsights.length === 0) {
    executiveInsights.push(`Sheet contains ${totalRows} records across ${columnCount} structural fields.`);
  }

  // 8. Column Summaries for Schema Inspector
  const columnSummaries: ColumnSummary[] = columns.map((col) => {
    const isNum = numericColumns.includes(col);
    const isDate = col === dateCol;
    const distinctSet = new Set();
    let sum = 0;
    let min: number | string = isNum ? Infinity : "";
    let max: number | string = isNum ? -Infinity : "";

    rows.forEach((row) => {
      const val = row[col];
      if (val !== null && val !== undefined && val !== "") {
        distinctSet.add(val);
        if (isNum) {
          const num = getNumericValue(val);
          sum += num;
          if (num < (min as number)) min = num;
          if (num > (max as number)) max = num;
        }
      }
    });

    return {
      header: col,
      type: isDate ? "date" : isNum ? "numeric" : "categorical",
      distinctCount: distinctSet.size,
      sum: isNum ? sum : undefined,
      avg: isNum && totalRows > 0 ? Math.round((sum / totalRows) * 100) / 100 : undefined,
      min: isNum && min !== Infinity ? min : undefined,
      max: isNum && max !== -Infinity ? max : undefined,
    };
  });

  return {
    totalRows,
    totalRevenue,
    averageRevenue,
    totalQuantity,
    topProduct,
    topProductSales,
    topProductShare,
    bestPeriod,
    growthRate,
    executiveInsights,
    productSales,
    monthlyRevenue,

    detectedSchema: {
      dateColumn: dateCol,
      revenueColumn: revenueCol,
      quantityColumn: quantityCol,
      productColumn: productCol,
      categoryColumn: categoryCol,
      regionColumn: regionCol,
      numericColumns,
      textColumns,
    },
    capabilities: {
      hasTimeDimension: Boolean(dateCol && timeSeries.length > 0),
      hasProductDimension: Boolean(productAnalyticsList.length > 0),
      hasCategoryDimension: Boolean(categoryAnalyticsList.length > 0),
      hasQuantityDimension: Boolean(quantityCol && totalQuantity > 0),
      hasRegionDimension: Boolean(regionalAnalyticsList.length > 0),
    },
    timeSeries,
    timeStats,
    productAnalytics: {
      topProducts,
      bottomProducts,
      totalProducts: productAnalyticsList.length,
    },
    categoryAnalytics: {
      categories: categoryAnalyticsList,
      topCategory: categoryAnalyticsList[0]?.name || null,
    },
    regionalAnalytics: {
      regions: regionalAnalyticsList,
    },
    quantityAnalytics: totalQuantity > 0 ? {
      totalQuantity,
      avgQuantityPerRow: totalRows > 0 ? Number((totalQuantity / totalRows).toFixed(1)) : 0,
      highestVolumeProduct: productAnalyticsList.sort((a, b) => b.quantity - a.quantity)[0]?.name || null,
    } : null,
    columnSummaries,
    sampleRows: rows.slice(0, 50),

    headers,
    columnCount,
  };
}