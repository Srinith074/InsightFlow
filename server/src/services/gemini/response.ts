import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateResponse(
  question: string,
  result: any
) {
  const prompt = `
Question:
${question}

Calculated Result:
${JSON.stringify(result)}

Answer naturally.
`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return res.text!;
}