
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";

import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "MongoDB models loaded successfully.",
      models: {
        conversation: Conversation.modelName,
        message: Message.modelName,
      },
    });
  } catch (error) {
    console.error("[Model Test]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load MongoDB models.",
      },
      { status: 500 }
    );
  }
}
