import { NextResponse } from "next/server";

import {
  searchWithGoogle,
} from "@/lib/ai/webSearch";

export async function POST(request) {
  try {
    const body = await request.json();

    const query = body?.query;

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Query is required.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await searchWithGoogle(query);

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "[Web Search API] Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform web search.",
      },
      {
        status: 500,
      }
    );
  }
}