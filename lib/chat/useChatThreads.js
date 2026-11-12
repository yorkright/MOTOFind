
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";

function makeEmptyThread() {
  return {
    id: null,
    title: "New chat",
    messages: [],
    createdAt: Date.now(),
  };
}

function normalizeThread(thread) {
  return {
    id: thread.id || thread._id,
    title: thread.title || "New chat",
    messages: thread.messages || [],
    createdAt: thread.createdAt || Date.now(),
    updatedAt: thread.updatedAt || null,
  };
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export function useChatThreads() {
  const { isLoaded: isAuthLoaded, userId } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);

  // Prevent an older conversation request from overwriting a newer selection.
  const selectionRequestRef = useRef(0);

  const activeThread = useMemo(
    () =>
      threads.find((thread) => thread.id === activeThreadId) ||
      makeEmptyThread(),
    [threads, activeThreadId]
  );

  // Load saved conversations when the chat UI first opens.
  useEffect(() => {
    if (!isAuthLoaded) return;

    let cancelled = false;
    selectionRequestRef.current += 1;
    setIsLoadingThreads(true);
    setThreads([]);
    setActiveThreadId(null);

    async function loadThreads() {
      try {
        const response = await fetch("/api/conversations", {
          method: "GET",
          cache: "no-store",
        });

        const data = await readResponse(response);

        if (cancelled) return;

        const loadedThreads = (data.conversations || []).map(
          (conversation) => ({
            ...normalizeThread(conversation),
            messages: [],
          })
        );

        if (loadedThreads.length > 0) {
          setThreads(loadedThreads);
        }
      } catch (error) {
        console.error("[Chat Threads] Failed to load conversations:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingThreads(false);
        }
      }
    }

    loadThreads();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoaded, userId]);

  // Create a new conversation in MongoDB.
  const createThread = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New chat" }),
      });

      const data = await readResponse(response);
      const newThread = normalizeThread(data.conversation);

      setThreads((previous) => [newThread, ...previous]);
      setActiveThreadId(newThread.id);

      return newThread.id;
    } catch (error) {
      console.error("[Chat Threads] Failed to create conversation:", error);
      throw error;
    }
  }, []);

  // Load the selected conversation and its messages from MongoDB.
  const selectThread = useCallback(async (id) => {
    if (!id) return;

    setActiveThreadId(id);

    const requestId = ++selectionRequestRef.current;

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await readResponse(response);

      // Ignore a response if the user selected another chat meanwhile.
      if (requestId !== selectionRequestRef.current) return;

      const loadedConversation = normalizeThread(data.conversation);

      setThreads((previous) =>
        previous.map((thread) =>
          thread.id === id
            ? {
              ...thread,
              ...loadedConversation,
            messages: data.conversation.messages || [],
            }
            : thread
        )
      );
    } catch (error) {
      console.error("[Chat Threads] Failed to load conversation:", error);
    }
  }, []);

  // Delete one conversation.
  const deleteThread = useCallback(
    async (id) => {
      if (!id) return;

      try {
        const response = await fetch(`/api/conversations/${id}`, {
          method: "DELETE",
        });

        await readResponse(response);

        const remainingThreads = threads.filter(
          (thread) => thread.id !== id
        );

        setThreads(remainingThreads);

        if (activeThreadId === id) {
          if (remainingThreads.length > 0) {
            await selectThread(remainingThreads[0].id);
          } else {
            await createThread();
          }
        }
      } catch (error) {
        console.error("[Chat Threads] Failed to delete conversation:", error);
        throw error;
      }
    },
    [threads, activeThreadId, selectThread, createThread]
  );

  // Delete every conversation belonging to this browser session.
  const clearAllThreads = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "DELETE",
      });

      await readResponse(response);

      setThreads([]);
      setActiveThreadId(null);

      await createThread();
    } catch (error) {
      console.error("[Chat Threads] Failed to clear conversations:", error);
      throw error;
    }
  }, [createThread]);

  // Rename a conversation in MongoDB.
  const renameThread = useCallback(async (id, title) => {
    const trimmedTitle = title.trim();

    if (!id || !trimmedTitle) return;

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle }),
      });

      const data = await readResponse(response);

      setThreads((previous) =>
        previous.map((thread) =>
          thread.id === id
            ? { ...thread, title: data.conversation.title }
            : thread
        )
      );
    } catch (error) {
      console.error("[Chat Threads] Failed to rename conversation:", error);
      throw error;
    }
  }, []);

  // Append new messages and persist them using POST.
  const appendMessages = useCallback(async (id, newMessages) => {
    if (!id || !newMessages?.length) return;

    // Update the UI immediately.
    setThreads((previous) =>
      previous.map((thread) =>
        thread.id === id
          ? {
            ...thread,
            messages: [...thread.messages, ...newMessages],
          }
          : thread
      )
    );

    try {
      const response = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await readResponse(response);

      setThreads((previous) => {
        const existingThread = previous.find((thread) => thread.id === id);
        const updatedThread = {
          ...(existingThread || normalizeThread(data.conversation)),
          title: data.conversation.title,
          updatedAt: data.conversation.updatedAt,
          messages: existingThread ? existingThread.messages : newMessages,
        };

        return [
          updatedThread,
          ...previous.filter((thread) => thread.id !== id),
        ];
      });

      return data;
    } catch (error) {
      console.error("[Chat Threads] Failed to save messages:", error);
      throw error;
    }
  }, []);

  // Replace the complete message history using PUT.
  // Used when regenerating an assistant response.
  const setThreadMessages = useCallback(async (id, messages) => {
    if (!id || !Array.isArray(messages)) return;

    // Update the UI immediately.
    setThreads((previous) =>
      previous.map((thread) =>
        thread.id === id
          ? { ...thread, messages }
          : thread
      )
    );

    try {
      const response = await fetch(`/api/conversations/${id}/messages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const data = await readResponse(response);

      setThreads((previous) =>
        previous.map((thread) =>
          thread.id === id
            ? {
              ...thread,
              title: data.conversation.title,
              updatedAt: data.conversation.updatedAt,
              messages: data.messages || messages,
            }
            : thread
        )
      );

      return data;
    } catch (error) {
      console.error(
        "[Chat Threads] Failed to replace conversation history:",
        error
      );
      throw error;
    }
  }, []);

  return {
    threads,
    activeThread,
    activeThreadId,
    createThread,
    selectThread,
    deleteThread,
    clearAllThreads,
    renameThread,
    appendMessages,
    setThreadMessages,
    isLoadingThreads,
  };
}
