import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured.");
}

export const ai = new GoogleGenAI({
  apiKey,
});

export const MODEL_NAME = "gemini-2.5-flash";
// export const MODEL_NAME = "gemini-3.5-flash";
// export const MODEL_NAME = "gemini-3.6-flash";
// export const MODEL_NAME = "gemini-3.7-flash";
