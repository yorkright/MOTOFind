
import { NextResponse } from "next/server";

import {
  getOrCreateSession,
  setSessionCookie,
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { sessionId, isNew } = getOrCreateSession(request);

    const response = NextResponse.json({
      success: true,
      message: isNew
        ? "New anonymous session created successfully."
        : "Existing anonymous session verified successfully.",
      sessionCreated: isNew,
      cookieName: "car_agent_session",
    });

    setSessionCookie(response, sessionId);

    return response;
  } catch (error) {
    console.error("[Session Test]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create or verify anonymous session.",
      },
      { status: 500 }
    );
  }
}
