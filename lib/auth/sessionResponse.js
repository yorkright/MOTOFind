
import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/session";

export function sessionJson(
  data,
  sessionId,
  status = 200
) {
  const response = NextResponse.json(data, { status });

  setSessionCookie(response, sessionId);

  return response;
}
