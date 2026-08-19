import { parseQuestion } from "./queryParser.js";
import { filterRows } from "./filter.js";
import {
  totalRevenue,
  averageRevenue,
  highestRevenue,
  lowestRevenue,
} from "./revenue.js";

export function answerQuestion(
  rows: any[],
  question: string,
  sheetName: string
) {
  const query = parseQuestion(question);

  // Sheet name
  if (query.intent === "sheet") {
    return `I'm using the "${sheetName}" sheet.`;
  }

  // Row count
  if (query.intent === "rows") {
    return `This sheet contains ${rows.length} rows.`;
  }

  // Columns
  if (query.intent === "columns") {
    return Object.keys(rows[0] || {}).join(", ");
  }

  // Filter by month/year if mentioned
  const filteredRows = filterRows(
    rows,
    query.month,
    query.year
  );

  if (!filteredRows.length) {
    return "No matching records found.";
  }

  switch (query.intent) {
    case "totalRevenue":
      return `Total Revenue = ₹${totalRevenue(filteredRows).toLocaleString()}`;

    case "averageRevenue":
      return `Average Revenue = ₹${averageRevenue(filteredRows).toFixed(2)}`;

    case "highestRevenue":
      return `Highest Revenue = ₹${highestRevenue(filteredRows).toLocaleString()}`;

    case "lowestRevenue":
      return `Lowest Revenue = ₹${lowestRevenue(filteredRows).toLocaleString()}`;

    default:
      return "Sorry, I don't understand that question yet.";
  }
}