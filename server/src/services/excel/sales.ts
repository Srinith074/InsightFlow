import { filterByMonth } from "./date.js";
import { getNumericValue } from "../analytics.service.js";

export function totalSales(
  rows: Record<string, unknown>[],
  month?: string,
  productName?: string
) {
  const filtered = filterByMonth(rows, month);
  if (filtered.length === 0) {
    return {
      month: month || "Overall",
      sales: 0,
      productBreakdown: {},
    };
  }

  const columns = Object.keys(filtered[0] || {});
  const productCol = columns.find((c) =>
    /^(product|product[\s_]?name|item|item[\s_]?name|sku|category)$/i.test(c.trim())
  );
  const qtyOrSalesCol = columns.find((c) =>
    /^(quantity|units|qty|sales[\s_]?count|sales|volume|units[\s_]?sold)$/i.test(c.trim())
  );
  const revCol = columns.find((c) =>
    /^(total[\s_]?revenue|revenue|sales[\s_]?amount|total[\s_]?sales|amount|total|price)$/i.test(c.trim())
  );

  let total = 0;
  const productBreakdown: Record<string, number> = {};

  if (productCol && (qtyOrSalesCol || revCol)) {
    // Row-based dataset
    const metricCol = qtyOrSalesCol || revCol!;
    filtered.forEach((row) => {
      const prod = String(row[productCol] ?? "").trim();
      if (productName && !prod.toLowerCase().includes(productName.toLowerCase())) {
        return;
      }
      const val = getNumericValue(row[metricCol]);
      total += val;
      if (prod) {
        productBreakdown[prod] = (productBreakdown[prod] || 0) + val;
      }
    });
  } else {
    // Column-based dataset
    filtered.forEach((row) => {
      columns.forEach((col) => {
        if (/^(date|timestamp|time|day|month|total[\s_]?revenue|revenue|amount)$/i.test(col.trim())) {
          return;
        }
        if (productName && !col.toLowerCase().includes(productName.toLowerCase())) {
          return;
        }
        const val = getNumericValue(row[col]);
        total += val;
        productBreakdown[col] = (productBreakdown[col] || 0) + val;
      });
    });
  }

  return {
    month: month || "Overall",
    product: productName || undefined,
    sales: total,
    productBreakdown,
  };
}