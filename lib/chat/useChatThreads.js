"use client";

import { useCallback, useMemo, useState } from "react";

function createId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function deriveTitle(firstUserMessage) {
  if (!firstUserMessage) return "New chat";
  const trimmed = firstUserMessage.trim();
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}...` : trimmed;
}

function makeEmptyThread() {
  return {
    id: createId(),
    title: "New chat",
    messages: [],
    createdAt: Date.now(),
  };
}

/**
 * In-memory chat thread management for the UI (sidebar list, active thread,
 * per-thread message history). No persistence yet — intentionally isolated
 * so a database-backed version can replace it later without any component
 * that consumes this hook needing to change.
 */
export function useChatThreads() {
  const [threads, setThreads] = useState(() => [makeEmptyThread()]);
  const [activeThreadId, setActiveThreadId] = useState(() => threads[0].id);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? threads[0],
    [threads, activeThreadId]
  );

  const createThread = useCallback(() => {
    const thread = makeEmptyThread();
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(thread.id);
    return thread.id;
  }, []);

  const selectThread = useCallback((id) => {
    setActiveThreadId(id);
  }, []);

  const deleteThread = useCallback(
    (id) => {
      setThreads((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (next.length === 0) {
          const fresh = makeEmptyThread();
          setActiveThreadId(fresh.id);
          return [fresh];
        }
        if (activeThreadId === id) {
          setActiveThreadId(next[0].id);
        }
        return next;
      });
    },
    [activeThreadId]
  );

  const clearAllThreads = useCallback(() => {
    const fresh = makeEmptyThread();
    setThreads([fresh]);
    setActiveThreadId(fresh.id);
  }, []);

  const renameThread = useCallback((id, title) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: title.trim() || t.title } : t))
    );
  }, []);

  /** Appends messages to a thread and auto-derives its title if still default. */
  const appendMessages = useCallback((id, newMessages) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const messages = [...t.messages, ...newMessages];
        const shouldRetitle = t.title === "New chat";
        const firstUser = messages.find((m) => m.role === "user");
        return {
          ...t,
          messages,
          title: shouldRetitle && firstUser ? deriveTitle(firstUser.content) : t.title,
        };
      })
    );
  }, []);

  /** Replaces a thread's full message array — used by regenerate/retry. */
  const setThreadMessages = useCallback((id, messages) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, messages } : t)));
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
  };
}