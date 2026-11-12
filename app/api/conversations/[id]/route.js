
import mongoose from "mongoose";

import connectDB from "@/lib/db/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

import { getConversationOwner } from "@/lib/auth/conversationOwner";
import { sessionJson } from "@/lib/auth/sessionResponse";

export const runtime = "nodejs";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET: Load one conversation and all its messages.
export async function GET(request, { params }) {
  const { sessionId, ownerFilter } = await getConversationOwner(request);
  const { id } = await params;

  if (!isValidId(id)) {
    return sessionJson(
      { success: false, error: "Invalid conversation ID." },
      sessionId,
      400
    );
  }

  try {
    await connectDB();

    const conversation = await Conversation.findOne({
      _id: id,
      ...ownerFilter,
    }).lean();

    if (!conversation) {
      return sessionJson(
        { success: false, error: "Conversation not found." },
        sessionId,
        404
      );
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1, _id: 1 })
      .lean();

    return sessionJson(
      {
        success: true,
        conversation: {
          id: conversation._id.toString(),
          title: conversation.title,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          messages: messages.map((message) => ({
            id: message._id.toString(),
            role: message.role,
            content: message.content,
            createdAt: message.createdAt,
          })),
        },
      },
      sessionId
    );
  } catch (error) {
    console.error("[Conversation GET]", error);

    return sessionJson(
      { success: false, error: "Failed to load conversation." },
      sessionId,
      500
    );
  }
}

// PATCH: Rename one conversation.
export async function PATCH(request, { params }) {
  const { sessionId, ownerFilter } = await getConversationOwner(request);
  const { id } = await params;

  if (!isValidId(id)) {
    return sessionJson(
      { success: false, error: "Invalid conversation ID." },
      sessionId,
      400
    );
  }

  try {
    const body = await request.json();

    if (
      typeof body.title !== "string" ||
      !body.title.trim() ||
      body.title.trim().length > 100
    ) {
      return sessionJson(
        {
          success: false,
          error: "Title must contain between 1 and 100 characters.",
        },
        sessionId,
        400
      );
    }

    await connectDB();

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, ...ownerFilter },
      { $set: { title: body.title.trim() } },
      { new: true, runValidators: true }
    );

    if (!conversation) {
      return sessionJson(
        { success: false, error: "Conversation not found." },
        sessionId,
        404
      );
    }

    return sessionJson(
      {
        success: true,
        conversation: {
          id: conversation._id.toString(),
          title: conversation.title,
          updatedAt: conversation.updatedAt,
        },
      },
      sessionId
    );
  } catch (error) {
    console.error("[Conversation PATCH]", error);

    return sessionJson(
      { success: false, error: "Failed to rename conversation." },
      sessionId,
      500
    );
  }
}

// DELETE: Delete one conversation and its messages.
export async function DELETE(request, { params }) {
  const { sessionId, ownerFilter } = await getConversationOwner(request);
  const { id } = await params;

  if (!isValidId(id)) {
    return sessionJson(
      { success: false, error: "Invalid conversation ID." },
      sessionId,
      400
    );
  }

  try {
    await connectDB();

    const conversation = await Conversation.findOne({
      _id: id,
      ...ownerFilter,
    });

    if (!conversation) {
      return sessionJson(
        { success: false, error: "Conversation not found." },
        sessionId,
        404
      );
    }

    await Message.deleteMany({ conversationId: conversation._id });
    await Conversation.deleteOne({
      _id: conversation._id,
      ...ownerFilter,
    });

    return sessionJson(
      {
        success: true,
        message: "Conversation deleted successfully.",
      },
      sessionId
    );
  } catch (error) {
    console.error("[Conversation DELETE]", error);

    return sessionJson(
      { success: false, error: "Failed to delete conversation." },
      sessionId,
      500
    );
  }
}
