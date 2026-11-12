import { auth } from "@clerk/nextjs/server";
import { getOrCreateSession } from "./session";

export async function getConversationOwner(request) {
  const { userId: clerkUserId } = await auth();
  const { sessionId } = getOrCreateSession(request);

  return {
    sessionId,
    clerkUserId: clerkUserId || null,
    ownerFilter: clerkUserId
      ? { clerkUserId }
      : { sessionId },
  };
}
