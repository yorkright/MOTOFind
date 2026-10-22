import { NextResponse } from "next/server";
import { getArticleImage } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "url is required." },
        { status: 400 }
      );
    }

    const image = await getArticleImage(url);

    return NextResponse.json({
      image,
    });
  } catch (error) {
    console.error("Image extraction failed:", error);

    return NextResponse.json(
      {
        image: null,
        error: "Unable to extract image.",
      },
      { status: 500 }
    );
  }
}