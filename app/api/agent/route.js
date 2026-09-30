import { NextResponse } from "next/server";
import { generateAgentResponse } from "@/lib/ai/agent";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_LENGTH = 30;

function validateMessages(messages) {
  if (!Array.isArray(messages)) {
    return "'messages' must be an array.";
  }

  if (messages.length === 0) {
    return "'messages' cannot be empty.";
  }

  if (messages.length > MAX_HISTORY_LENGTH) {
    return `Too many messages in history (max ${MAX_HISTORY_LENGTH}).`;
  }

  for (const m of messages) {
    if (!m || typeof m !== "object") {
      return "Each message must be an object.";
    }

    if (
      m.role !== "user" &&
      m.role !== "assistant"
    ) {
      return "Each message must have role 'user' or 'assistant'.";
    }

    if (
      typeof m.content !== "string" ||
      m.content.trim().length === 0
    ) {
      return "Each message must have non-empty string content.";
    }

    if (m.content.length > MAX_MESSAGE_LENGTH) {
      return `Message content exceeds ${MAX_MESSAGE_LENGTH} characters.`;
    }
  }

  return null;
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { messages } = body ?? {};

  const validationError = validateMessages(messages);

  if (validationError) {
    return NextResponse.json(
      { error: validationError },
      { status: 400 }
    );
  }

  try {
    const reply = await generateAgentResponse(messages);

    return NextResponse.json(
      { reply },
      { status: 200 }
    );
  } catch (err) {
    console.error(
      "[/api/agent] Gemini request failed:",
      err
    );

    return NextResponse.json(
      {
        error:
          "The assistant is temporarily unavailable. Please try again.",
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed. Use POST.",
    },
    {
      status: 405,
    }
  );
}