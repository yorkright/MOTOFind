
import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "crypto";

const SESSION_COOKIE_NAME = "car_agent_session";
const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be configured with at least 32 characters."
    );
  }

  return secret;
}

// Creates a signature for a session ID.
function signSessionId(sessionId) {
  return createHmac("sha256", getSessionSecret())
    .update(sessionId)
    .digest("hex");
}

// Verifies that a cookie contains a valid session ID and signature.
function verifySessionToken(token) {
  if (typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [sessionId, receivedSignature] = parts;

  // Session IDs are generated using crypto.randomUUID().
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(sessionId)) {
    return null;
  }

  const expectedSignature = signSessionId(sessionId);

  const receivedBuffer = Buffer.from(receivedSignature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  return sessionId;
}

// Reads the existing session or creates a new anonymous session.
export function getOrCreateSession(request) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const existingSessionId = cookie
    ? verifySessionToken(cookie)
    : null;

  if (existingSessionId) {
    return {
      sessionId: existingSessionId,
      isNew: false,
    };
  }

  return {
    sessionId: randomUUID(),
    isNew: true,
  };
}

// Adds a signed, secure session cookie to an API response.
export function setSessionCookie(response, sessionId) {
  const signature = signSessionId(sessionId);
  const token = `${sessionId}.${signature}`;

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });

  return response;
}
