import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export async function askGemini(prompt: string, systemPreamble?: string): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API key not configured");
  }
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const finalPrompt = systemPreamble ? `${systemPreamble}\n\nUser: ${prompt}` : prompt;
  const result = await model.generateContent(finalPrompt);
  const text = result.response.text();
  return text?.trim() || "";
}
