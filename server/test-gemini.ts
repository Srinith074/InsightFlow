import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

console.log("KEY:", process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    console.log("Sending request...");

    const result = await model.generateContent("Say hello");

    console.log(result.response.text());
  } catch (err) {
    console.error(err);
  }
}

test();