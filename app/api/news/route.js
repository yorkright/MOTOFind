import { NextResponse } from "next/server";
import { getIndiaCarNews } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "1";

    const result = await getIndiaCarNews({ refresh });

    return NextResponse.json({
      articles: Array.isArray(result?.articles) ? result.articles : [],
      topStories: Array.isArray(result?.topStories) ? result.topStories : [],
      lastUpdated: result?.lastUpdated || null,
    });
  } catch (error) {
    console.error("News fetch failed:", error);

    return NextResponse.json(
      {
        articles: [],
        topStories: [],
        lastUpdated: null,
        error: "Unable to load car news right now.",
      },
      { status: 500 }
    );
  }
}