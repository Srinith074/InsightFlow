import { GoogleGenAI } from "@google/genai";
import { MONTHS } from "../analytics.service.js";

export interface ExtractedIntent {
  intent:
    | "revenue"
    | "average"
    | "highest"
    | "lowest"
    | "sales"
    | "production"
    | "compare"
    | "row_count"
    | "columns"
    | "summary"
    | "unknown";
  month?: string;
  months?: string[];
  year?: number;
  product?: string;
}

export function parseIntentRules(question: string): ExtractedIntent {
  const q = question.toLowerCase().trim();

  // Find mentioned months
  const foundMonths: string[] = [];
  MONTHS.forEach((m) => {
    const fullPattern = new RegExp(`\\b${m.toLowerCase()}\\b`, "i");
    const shortPattern = new RegExp(`\\b${m.slice(0, 3).toLowerCase()}\\b`, "i");
    if (fullPattern.test(q) || (m.length > 3 && shortPattern.test(q))) {
      if (!foundMonths.includes(m)) {
        foundMonths.push(m);
      }
    }
  });

  const yearMatch = q.match(/\b20\d{2}\b/);
  const year = yearMatch ? Number(yearMatch[0]) : undefined;

  // Comparison intent
  if (
    (q.includes("compare") || q.includes("vs") || q.includes("versus") || q.includes("difference")) &&
    foundMonths.length >= 2
  ) {
    return {
      intent: "compare",
      months: [foundMonths[0], foundMonths[1]],
      year,
    };
  }

  // Row count / dataset size
  if (
    q.includes("how many rows") ||
    q.includes("how many records") ||
    q.includes("number of rows") ||
    q.includes("number of records") ||
    q.includes("row count") ||
    q.includes("record count") ||
    q.includes("total rows") ||
    q.includes("total records")
  ) {
    return { intent: "row_count", month: foundMonths[0], year };
  }

  // Columns / headers / schema
  if (
    q.includes("column") ||
    q.includes("header") ||
    q.includes("field") ||
    q.includes("schema") ||
    q.includes("structure")
  ) {
    return { intent: "columns", year };
  }

  // Highest / top / maximum
  if (
    q.includes("highest") ||
    q.includes("top") ||
    q.includes("maximum") ||
    q.includes("max") ||
    q.includes("best selling") ||
    q.includes("most")
  ) {
    return { intent: "highest", month: foundMonths[0], year };
  }

  // Lowest / minimum / least
  if (
    q.includes("lowest") ||
    q.includes("minimum") ||
    q.includes("min") ||
    q.includes("least") ||
    q.includes("worst")
  ) {
    return { intent: "lowest", month: foundMonths[0], year };
  }

  // Average
  if (q.includes("average") || q.includes("avg") || q.includes("mean")) {
    return { intent: "average", month: foundMonths[0], year };
  }

  // Production
  if (
    q.includes("production") ||
    q.includes("produced") ||
    q.includes("output") ||
    q.includes("manufactured")
  ) {
    return { intent: "production", month: foundMonths[0], year };
  }

  // Sales
  if (
    q.includes("sales") ||
    q.includes("units sold") ||
    q.includes("quantity sold") ||
    q.includes("volume")
  ) {
    return { intent: "sales", month: foundMonths[0], year };
  }

  // Revenue
  if (
    q.includes("revenue") ||
    q.includes("income") ||
    q.includes("earned") ||
    q.includes("total") ||
    q.includes("financial")
  ) {
    return { intent: "revenue", month: foundMonths[0], year };
  }

  // Default summary if general question
  if (q.includes("summary") || q.includes("overview") || q.includes("analyze") || q.includes("insights")) {
    return { intent: "summary", month: foundMonths[0], year };
  }

  return { intent: foundMonths.length > 0 ? "revenue" : "unknown", month: foundMonths[0], year };
}

export async function extractIntent(question: string): Promise<ExtractedIntent> {
  const ruleIntent = parseIntentRules(question);

  // If rules clearly found a specific intent, return it directly
  if (ruleIntent.intent !== "unknown") {
    return ruleIntent;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return ruleIntent;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are an intent extractor for a business analytics dataset query engine.
Return ONLY raw valid JSON, no markdown formatting or commentary.

Possible intents:
- revenue
- sales
- production
- highest
- lowest
- compare
- average
- row_count
- columns
- summary

Possible filters:
- month (e.g. "May", "June")
- months (array of 2 strings if comparing, e.g. ["May", "June"])
- year (number)
- product (string)

Question:
"${question}"

JSON schema:
{
  "intent": "revenue" | "sales" | "production" | "highest" | "lowest" | "compare" | "average" | "row_count" | "columns" | "summary",
  "month"?: string,
  "months"?: string[],
  "year"?: number,
  "product"?: string
}
`;

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = res.text?.trim() || "";
    const cleanJson = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const parsed = JSON.parse(cleanJson) as ExtractedIntent;

    if (parsed && parsed.intent) {
      return parsed;
    }
  } catch (error) {
    console.warn("Gemini intent extraction fallback to rule parser:", error);
  }

  return ruleIntent;
}