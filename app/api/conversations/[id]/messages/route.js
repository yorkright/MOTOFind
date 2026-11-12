
import mongoose from "mongoose";

import connectDB from "@/lib/db/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

import { getConversationOwner } from "@/lib/auth/conversationOwner";
import { sessionJson } from "@/lib/auth/sessionResponse";

export const runtime = "nodejs";

const MAX_MESSAGES_PER_REQUEST = 30;
const MAX_MESSAGE_LENGTH = 20000;

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function deriveTitle(content) {
  const trimmed = content.trim();

  return trimmed.length > 42
    ? `${trimmed.slice(0, 42)}...`
    : trimmed;
}

function validateMessages(messages, allowEmpty = false) {
  if (
    !Array.isArray(messages) ||
    (!allowEmpty && messages.length === 0) ||
    messages.length > MAX_MESSAGES_PER_REQUEST
  ) {
    return `Messages must be an array containing ${
      allowEmpty ? "0" : "1"
    } to ${MAX_MESSAGES_PER_REQUEST} items.`;
  }

  for (const message of messages) {
    if (
      !message ||
      !["user", "assistant"].includes(message.role) ||
      typeof message.content !== "string" ||
      !message.content.trim() ||
      message.content.length > MAX_MESSAGE_LENGTH
    ) {
      return "Each message must have a valid role and non-empty content of at most 20000 characters.";
    }
  }

  return null;
}

async function findOwnedConversation(id, ownerFilter) {
  return Conversation.findOne({
    _id: id,
    ...ownerFilter,
  });
}

function formatMessages(messages) {
  return messages.map((message) => ({
    id: message._id.toString(),
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
  }));
}


// POST: Save new messages to a conversation.
export async function POST(request, { params }) {
  const { sessionId, clerkUserId, ownerFilter } =
    await getConversationOwner(request);
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
    const { messages } = body ?? {};

    const validationError = validateMessages(messages);

    if (validationError) {
      return sessionJson(
        { success: false, error: validationError },
        sessionId,
        400
      );
    }

    await connectDB();

    const conversation = await findOwnedConversation(id, ownerFilter);

    if (!conversation) {
      return sessionJson(
        { success: false, error: "Conversation not found." },
        sessionId,
        404
      );
    }

    const messagesToSave = messages.map((message) => ({
      conversationId: conversation._id,
      clerkUserId,
      role: message.role,
      content: message.content.trim(),
    }));

    const savedMessages = await Message.insertMany(messagesToSave);

    // Automatically title a new conversation using its first user message.
    if (conversation.title === "New chat") {
      const firstUserMessage = await Message.findOne({
        conversationId: conversation._id,
        role: "user",
      }).sort({ createdAt: 1, _id: 1 });

      if (firstUserMessage) {
        conversation.title = deriveTitle(firstUserMessage.content);
      }
    }

    conversation.updatedAt = new Date();
    await conversation.save();

    return sessionJson(
      {
        success: true,
        message: "Messages saved successfully.",
        conversation: {
          id: conversation._id.toString(),
          title: conversation.title,
          updatedAt: conversation.updatedAt,
        },
        messages: formatMessages(savedMessages),
      },
      sessionId,
      201
    );
  } catch (error) {
    console.error("[Conversation Messages POST]", error);

    return sessionJson(
      { success: false, error: "Failed to save messages." },
      sessionId,
      500
    );
  }
}

// PUT: Replace the complete message history.
// Used when regenerating an AI response or correcting conversation history.
export async function PUT(request, { params }) {
  const { sessionId, clerkUserId, ownerFilter } =
    await getConversationOwner(request);
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
    const { messages } = body ?? {};

    const validationError = validateMessages(messages, true);

    if (validationError) {
      return sessionJson(
        { success: false, error: validationError },
        sessionId,
        400
      );
    }

    await connectDB();

    const conversation = await findOwnedConversation(id, ownerFilter);

    if (!conversation) {
      return sessionJson(
        { success: false, error: "Conversation not found." },
        sessionId,
        404
      );
    }

    // Remove the previous history.
    await Message.deleteMany({
      conversationId: conversation._id,
    });

    // Save the replacement history.
    let savedMessages = [];

    if (messages.length > 0) {
      const messagesToSave = messages.map((message) => ({
        conversationId: conversation._id,
        clerkUserId,
        role: message.role,
        content: message.content.trim(),
      }));

      savedMessages = await Message.insertMany(messagesToSave);
    }

    // Recalculate the conversation title.
    const firstUserMessage = messages.find(
      (message) => message.role === "user"
    );

    conversation.title = firstUserMessage
      ? deriveTitle(firstUserMessage.content)
      : "New chat";

    conversation.updatedAt = new Date();
    await conversation.save();

    return sessionJson(
      {
        success: true,
        message: "Conversation history replaced successfully.",
        conversation: {
          id: conversation._id.toString(),
          title: conversation.title,
          updatedAt: conversation.updatedAt,
        },
        messages: formatMessages(savedMessages),
      },
      sessionId
    );
  } catch (error) {
    console.error("[Conversation Messages PUT]", error);

    return sessionJson(
      { success: false, error: "Failed to replace conversation history." },
      sessionId,
      500
    );
  }
}
