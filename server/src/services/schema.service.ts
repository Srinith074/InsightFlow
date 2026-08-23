export type InferredColumnType =
  | "DATE"
  | "DATETIME"
  | "CURRENCY"
  | "PERCENTAGE"
  | "QUANTITY"
  | "NUMERIC"
  | "BOOLEAN"
  | "IDENTIFIER"
  | "CATEGORY"
  | "TEXT";

export type DatasetDomain = "sales" | "expense" | "inventory" | "crm" | "general";

export interface ColumnSchemaInfo {
  name: string;
  inferredType: InferredColumnType;
  sampleValues: (string | number | boolean)[];
  totalCount: number;
  nullCount: number;
  distinctCount: number;
  min?: string | number;
  max?: string | number;
  description: string;
}

export interface DataQualityReport {
  totalRows: number;
  columnCount: number;
  qualityScore: number;
  missingValuesCount: number;
  duplicateRowsCount: number;
  invalidDateCount: number;
  invalidNumericCount: number;
  warnings: string[];
}

export interface SchemaDetectionResult {
  domain: DatasetDomain;
  columns: ColumnSchemaInfo[];
  quality: DataQualityReport;
  keyDimensions: {
    dateColumn: string | null;
    primaryMetricColumn: string | null;
    primaryMetricType: "revenue" | "cost" | "units" | "general";
    dimensionColumn: string | null;
    categoryColumn: string | null;
    quantityColumn: string | null;
  };
}

const DATE_REGEX = /^(date|timestamp|time|day|order_date|transaction_date|month|period|invoice_date|created_at)$/i;
const CURRENCY_HEADER_REGEX = /^(revenue|sales|total_sales|total_revenue|amount|total|price|cost|expense|spending|budget|profit|margin|subtotal|mrp|discount)$/i;
const QUANTITY_HEADER_REGEX = /^(qty|quantity|units|units_sold|volume|count|pieces|items|inventory|stock|orders)$/i;
const IDENTIFIER_HEADER_REGEX = /^(id|_id|order_id|invoice_id|sku|uuid|transaction_id|cust_id|customer_id|emp_id)$/i;
const CATEGORY_HEADER_REGEX = /^(category|department|dept|segment|type|group|class|family|division|status|region|country|city|state)$/i;

export function inferColumnType(
  colName: string,
  values: unknown[]
): InferredColumnType {
  const trimmedHeader = colName.trim().toLowerCase();

  // 1. Identifier heuristic
  if (IDENTIFIER_HEADER_REGEX.test(trimmedHeader)) {
    return "IDENTIFIER";
  }

  // 2. Sample first 100 non-null values
  const nonNullValues = values
    .filter((v) => v !== null && v !== undefined && v !== "")
    .slice(0, 100);

  if (nonNullValues.length === 0) {
    return "TEXT";
  }

  let dateCount = 0;
  let numericCount = 0;
  let currencyCount = 0;
  let percentCount = 0;
  let boolCount = 0;

  for (const val of nonNullValues) {
    if (typeof val === "boolean") {
      boolCount++;
      continue;
    }

    if (typeof val === "string") {
      const s = val.trim();
      if (/^(true|false|yes|no|y|n)$/i.test(s)) {
        boolCount++;
        continue;
      }
      if (/[₹$€£¥]/.test(s)) {
        currencyCount++;
      }
      if (/%$/.test(s)) {
        percentCount++;
      }
    }

    if (val instanceof Date) {
      dateCount++;
      continue;
    }

    if (typeof val === "number") {
      numericCount++;
      continue;
    }

    if (typeof val === "string") {
      const cleaned = val.replace(/[₹$€£,%\s]/g, "");
      if (!Number.isNaN(Number(cleaned)) && cleaned !== "") {
        numericCount++;
      } else {
        // Test date parsing
        const parsedDate = Date.parse(val);
        if (!Number.isNaN(parsedDate) && /[\d]{1,4}[-/.\s][\d]{1,2}/.test(val)) {
          dateCount++;
        }
      }
    }
  }

  const sampleSize = nonNullValues.length;

  if (boolCount >= sampleSize * 0.7) return "BOOLEAN";
  if (dateCount >= sampleSize * 0.6 || DATE_REGEX.test(trimmedHeader)) return "DATE";
  if (currencyCount >= sampleSize * 0.5 || CURRENCY_HEADER_REGEX.test(trimmedHeader)) return "CURRENCY";
  if (percentCount >= sampleSize * 0.5) return "PERCENTAGE";

  if (numericCount >= sampleSize * 0.7) {
    if (QUANTITY_HEADER_REGEX.test(trimmedHeader)) {
      return "QUANTITY";
    }
    return "NUMERIC";
  }

  // Check cardinality for Category vs Text
  const uniqueCount = new Set(nonNullValues.map((v) => String(v).trim().toLowerCase())).size;
  if (uniqueCount <= Math.max(10, sampleSize * 0.35) || CATEGORY_HEADER_REGEX.test(trimmedHeader)) {
    return "CATEGORY";
  }

  return "TEXT";
}

export function detectDatasetSchema(rows: Record<string, unknown>[]): SchemaDetectionResult {
  const totalRows = rows.length;

  if (totalRows === 0) {
    return {
      domain: "general",
      columns: [],
      quality: {
        totalRows: 0,
        columnCount: 0,
        qualityScore: 100,
        missingValuesCount: 0,
        duplicateRowsCount: 0,
        invalidDateCount: 0,
        invalidNumericCount: 0,
        warnings: ["The selected sheet contains no rows."],
      },
      keyDimensions: {
        dateColumn: null,
        primaryMetricColumn: null,
        primaryMetricType: "general",
        dimensionColumn: null,
        categoryColumn: null,
        quantityColumn: null,
      },
    };
  }

  const headers = Object.keys(rows[0] || {});
  const columnCount = headers.length;

  let totalMissing = 0;
  let invalidDates = 0;
  let invalidNumerics = 0;
  const warnings: string[] = [];

  // Check duplicate rows using stringified row signatures
  const rowSignatures = new Set<string>();
  let duplicateCount = 0;

  rows.forEach((row) => {
    const sig = JSON.stringify(row);
    if (rowSignatures.has(sig)) {
      duplicateCount++;
    } else {
      rowSignatures.add(sig);
    }
  });

  if (duplicateCount > 0) {
    warnings.push(`Detected ${duplicateCount} duplicate records in this sheet.`);
  }

  // Inspect each column
  const columnInfos: ColumnSchemaInfo[] = headers.map((header) => {
    const colValues = rows.map((r) => r[header]);
    const inferredType = inferColumnType(header, colValues);

    let nullCount = 0;
    const distinctSet = new Set<string>();
    let numMin = Infinity;
    let numMax = -Infinity;

    colValues.forEach((v) => {
      if (v === null || v === undefined || v === "") {
        nullCount++;
        totalMissing++;
      } else {
        distinctSet.add(String(v));

        if (inferredType === "NUMERIC" || inferredType === "CURRENCY" || inferredType === "QUANTITY") {
          const cleaned = String(v).replace(/[^\d.-]/g, "");
          const num = Number(cleaned);
          if (Number.isNaN(num)) {
            invalidNumerics++;
          } else {
            if (num < numMin) numMin = num;
            if (num > numMax) numMax = num;
          }
        } else if (inferredType === "DATE") {
          if (typeof v === "string") {
            const parsed = Date.parse(v);
            if (Number.isNaN(parsed) && !/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(v)) {
              invalidDates++;
            }
          }
        }
      }
    });

    if (nullCount > totalRows * 0.15) {
      warnings.push(`Column "${header}" has ${nullCount} missing values (${Math.round((nullCount / totalRows) * 100)}%).`);
    }

    const nonNullSamples = colValues
      .filter((v) => v !== null && v !== undefined && v !== "")
      .slice(0, 3) as (string | number | boolean)[];

    return {
      name: header,
      inferredType,
      sampleValues: nonNullSamples,
      totalCount: totalRows,
      nullCount,
      distinctCount: distinctSet.size,
      min: numMin !== Infinity ? numMin : undefined,
      max: numMax !== -Infinity ? numMax : undefined,
      description: `${inferredType.toLowerCase()} column with ${distinctSet.size} unique values`,
    };
  });

  // Calculate overall data quality score (0 - 100%)
  const totalCells = totalRows * Math.max(1, columnCount);
  const qualityDeductions = (totalMissing / totalCells) * 50 + (duplicateCount / totalRows) * 30 + ((invalidDates + invalidNumerics) / totalCells) * 20;
  const qualityScore = Math.max(0, Math.min(100, Math.round(100 - qualityDeductions)));

  // Domain & Dimension Detection
  const dateCol = columnInfos.find((c) => c.inferredType === "DATE")?.name || null;
  const currencyCol = columnInfos.find((c) => c.inferredType === "CURRENCY")?.name || null;
  const qtyCol = columnInfos.find((c) => c.inferredType === "QUANTITY")?.name || null;
  const catCol = columnInfos.find((c) => c.inferredType === "CATEGORY")?.name || null;
  const textCol = columnInfos.find((c) => c.inferredType === "CATEGORY" || c.inferredType === "TEXT")?.name || null;

  let domain: DatasetDomain = "general";
  let primaryMetricType: "revenue" | "cost" | "units" | "general" = "general";

  const allHeaderStr = headers.join(" ").toLowerCase();

  if (/revenue|sales|product|order|customer|mrp/.test(allHeaderStr)) {
    domain = "sales";
    primaryMetricType = "revenue";
  } else if (/expense|cost|vendor|department|salary|spending/.test(allHeaderStr)) {
    domain = "expense";
    primaryMetricType = "cost";
  } else if (/inventory|stock|warehouse|sku|batch/.test(allHeaderStr)) {
    domain = "inventory";
    primaryMetricType = "units";
  } else if (/lead|stage|deal|pipeline|contact/.test(allHeaderStr)) {
    domain = "crm";
  }

  const primaryMetric =
    currencyCol ||
    columnInfos.find((c) => c.inferredType === "NUMERIC" && /total|amount|cost|revenue|sales/i.test(c.name))?.name ||
    qtyCol ||
    columnInfos.find((c) => c.inferredType === "NUMERIC")?.name ||
    null;

  return {
    domain,
    columns: columnInfos,
    quality: {
      totalRows,
      columnCount,
      qualityScore,
      missingValuesCount: totalMissing,
      duplicateRowsCount: duplicateCount,
      invalidDateCount: invalidDates,
      invalidNumericCount: invalidNumerics,
      warnings,
    },
    keyDimensions: {
      dateColumn: dateCol,
      primaryMetricColumn: primaryMetric,
      primaryMetricType,
      dimensionColumn: textCol,
      categoryColumn: catCol,
      quantityColumn: qtyCol,
    },
  };
}
