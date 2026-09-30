import { NextResponse } from "next/server";
import { getCars } from "@/lib/cars/getCars.js";

export async function GET() {
  const result = await getCars({ limit: 5 });

  if (!result.success) {
    const isUpstreamIssue = result.error?.code === "CAR_API_UPSTREAM_MISCONFIGURED";

    return NextResponse.json(
      {
        success: false,
        provider: process.env.CAR_DATA_PROVIDER || "carapis",
        error: result.error,
        hint: isUpstreamIssue
          ? "This is a provider-side issue with Carapis's hosting, not your app's config. Contact api-support@carapis.com."
          : undefined,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    provider: process.env.CAR_DATA_PROVIDER || "carapis",
    count: result.count,
    cars: result.cars,
  });
}