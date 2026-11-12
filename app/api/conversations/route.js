
import connectDB from "@/lib/db/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

import { getConversationOwner } from "@/lib/auth/conversationOwner";
import { sessionJson } from "@/lib/auth/sessionResponse";

export const runtime = "nodejs";

// GET: List conversations belonging to the current Clerk user or guest session.
export async function GET(request) {
  const { sessionId, ownerFilter } = await getConversationOwner(request);

  try {
    await connectDB();

    const conversations = await Conversation.find(ownerFilter)
      .sort({ updatedAt: -1 })
      .select("_id title createdAt updatedAt")
      .lean();

    const result = conversations.map((conversation) => ({
      id: conversation._id.toString(),
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }));

    return sessionJson(
      { success: true, conversations: result },
      sessionId
    );
  } catch (error) {
    console.error("[Conversations GET]", error);

    return sessionJson(
      { success: false, error: "Failed to load conversations." },
      sessionId,
      500
    );
  }
}

// POST: Create a new conversation.
export async function POST(request) {
  const { sessionId, clerkUserId } = await getConversationOwner(request);

  try {
    const body = await request.json().catch(() => ({}));

    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim().slice(0, 100)
        : "New chat";

    await connectDB();

    const conversation = await Conversation.create({
      sessionId,
      clerkUserId,
      title,
    });

    return sessionJson(
      {
        success: true,
        conversation: {
          id: conversation._id.toString(),
          title: conversation.title,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          messages: [],
        },
      },
      sessionId,
      201
    );
  } catch (error) {
    console.error("[Conversations POST]", error);

    return sessionJson(
      { success: false, error: "Failed to create conversation." },
      sessionId,
      500
    );
  }
}

// DELETE: Delete all conversations belonging to the current owner.
export async function DELETE(request) {
  const { sessionId, ownerFilter } = await getConversationOwner(request);

  try {
    await connectDB();

    const conversations = await Conversation.find(ownerFilter)
      .select("_id")
      .lean();

    const conversationIds = conversations.map(
      (conversation) => conversation._id
    );

    if (conversationIds.length > 0) {
      await Message.deleteMany({
        conversationId: { $in: conversationIds },
      });

      await Conversation.deleteMany(ownerFilter);
    }

    return sessionJson(
      {
        success: true,
        message: "All conversations deleted successfully.",
        deletedCount: conversationIds.length,
      },
      sessionId
    );
  } catch (error) {
    console.error("[Conversations DELETE]", error);

    return sessionJson(
      { success: false, error: "Failed to clear conversations." },
      sessionId,
      500
    );
  }
}
