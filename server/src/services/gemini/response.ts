import { GoogleGenAI } from "@google/genai";

export function formatDeterministicFallback(
  _question: string,
  result: Record<string, unknown>
): string {
  if (!result) return "No data available for this query.";

  if (typeof result.error === "string") {
    return result.error;
  }

  // Comparison
  if (result.month1 && result.month2 && result.revenue1 !== undefined && result.revenue2 !== undefined) {
    const rev1 = Number(result.revenue1).toLocaleString("en-IN");
    const rev2 = Number(result.revenue2).toLocaleString("en-IN");
    const diff = Number(result.difference).toLocaleString("en-IN");
    const pct = result.percentageChange;
    const higher = result.higher;
    return `In ${result.month1}, revenue was ₹${rev1}, and in ${result.month2}, it was ₹${rev2}. The difference is ₹${diff} (${pct}% change), with ${higher} generating higher revenue.`;
  }

  // Revenue stats (total / average / highest / lowest)
  if (result.totalRevenue !== undefined) {
    const total = Number(result.totalRevenue).toLocaleString("en-IN");
    const avg = Math.round(Number(result.averageRevenue)).toLocaleString("en-IN");
    const high = Number(result.highestRevenue).toLocaleString("en-IN");
    const low = Number(result.lowestRevenue).toLocaleString("en-IN");
    return `For ${result.month ?? "the dataset"}: Total revenue is ₹${total} (average ₹${avg} per record, peak ₹${high}, minimum ₹${low}) across ${result.rowCount ?? 0} records.`;
  }

  // Monthly revenue
  if (result.revenue !== undefined) {
    const rev = Number(result.revenue).toLocaleString("en-IN");
    return `Total revenue for ${result.month ?? "the selected period"} is ₹${rev}${result.rowCount !== undefined ? ` across ${result.rowCount} records` : ""}.`;
  }

  // Sales
  if (result.sales !== undefined) {
    const s = Number(result.sales).toLocaleString("en-IN");
    return `Total sales for ${result.month ?? "the selected period"}${result.product ? ` (${result.product})` : ""} is ${s} units/amount.`;
  }

  // Production
  if (result.production !== undefined) {
    const p = Number(result.production).toLocaleString("en-IN");
    return `Total production for ${result.month ?? "the selected period"} is ${p} units.`;
  }

  // Row count
  if (result.rowCount !== undefined && result.columnCount !== undefined) {
    return `This sheet contains ${result.rowCount} rows and ${result.columnCount} columns.`;
  }

  // Columns / headers
  if (Array.isArray(result.columns)) {
    return `The available columns are: ${result.columns.join(", ")}.`;
  }

  // Dashboard / Summary
  if (result.topProduct !== undefined) {
    const total = Number(result.totalRevenue ?? 0).toLocaleString("en-IN");
    return `Dataset Summary: Total revenue is ₹${total}, top performing product is ${result.topProduct} (₹${Number(result.topProductSales ?? 0).toLocaleString("en-IN")}), with ${result.totalRows ?? 0} total records.`;
  }

  return JSON.stringify(result);
}

export async function generateResponse(
  question: string,
  result: Record<string, unknown>
): Promise<string> {
  const fallback = formatDeterministicFallback(question, result);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are InsightFlow AI, an executive-grade business analytics advisor.

CRITICAL RULES:
1. The "Calculated Result" below is the absolute ground truth calculated deterministically from the user's dataset.
2. DO NOT alter, re-calculate, or invent numerical values. Use the exact numbers provided.
3. Formulate a natural, concise, professional 1 to 3 sentence answer to the user's question using the exact calculated data.
4. Format currency amounts in Indian Rupees (₹) or standard notation matching the calculation.

Question:
"${question}"

Calculated Result:
${JSON.stringify(result, null, 2)}

Provide your response:
`;

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = res.text?.trim();
    if (text) {
      return text;
    }
  } catch (error) {
    console.warn("Gemini response generation fallback to deterministic template:", error);
  }

  return fallback;
}