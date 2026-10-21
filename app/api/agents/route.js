import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractArticleText(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CarNewsAgent/1.0)",
      },
    });

    if (!res.ok) return "";

    const html = await res.text();
    const $ = cheerio.load(html);

    $("script, style, nav, footer, header, aside, iframe").remove();

    const text = $("p")
      .map((_, el) => $(el).text().trim())
      .get()
      .join("\n")
      .slice(0, 12000);

    return text;
  } catch {
    return "";
  }
}

export async function POST(request) {
  try {
    const { articleUrl, articleTitle, question } = await request.json();

    if (!articleUrl || !question) {
      return NextResponse.json(
        { error: "articleUrl and question are required." },
        { status: 400 }
      );
    }

    const articleText = await extractArticleText(articleUrl);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [
        {
          googleSearch: {},
        },
      ],
    });

    const prompt = `
You are an Indian automotive news assistant.

The user selected this news article:
Title: ${articleTitle}
URL: ${articleUrl}

Article content:
${articleText || "Full article text could not be extracted."}

User question:
${question}

Rules:
- Focus on Indian car buyers, prices, launches, mileage, safety, EVs, regulations, and market impact when relevant.
- If the article text is incomplete, use Google Search grounding to verify facts.
- Be concise, factual, and easy to understand.
- Mention uncertainty when information is unclear.
- Include source links when you use web results.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const answer = response.text();

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { error: "AI could not answer right now." },
      { status: 500 }
    );
  }
}