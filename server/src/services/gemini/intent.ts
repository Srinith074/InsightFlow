import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function extractIntent(question: string) {
  const prompt = `
You are an intent extractor.

Return ONLY valid JSON.

Possible intents:
- revenue
- sales
- production
- raw_material
- highest_sale
- lowest_sale
- compare
- average

Possible filters:
month
year
product
date

Question:
${question}

Example:

{
  "intent":"revenue",
  "month":"May"
}
`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return JSON.parse(res.text!);
}