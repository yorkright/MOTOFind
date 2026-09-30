"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { MenuIcon, PlusIcon, SparkleIcon } from "./icons";
import { useChatThreads } from "@/lib/chat/useChatThreads";

export default function ChatContainer() {
  const {
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
  } = useChatThreads();

  // Closed by default on every device, every refresh — opens only when the
  // user explicitly clicks the toggle.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [activeThread?.messages, loading]);

  async function callAgent(messages) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      appendMessages(activeThreadId, [
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(err.message || "Failed to reach the assistant.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(content) {
    const userMessage = { role: "user", content };
    const nextMessages = [...activeThread.messages, userMessage];
    appendMessages(activeThreadId, [userMessage]);
    await callAgent(nextMessages);
  }

  async function handleRegenerate() {
    const messages = activeThread.messages;
    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1) return;
    const trimmed = messages.slice(0, lastUserIdx + 1);
    setThreadMessages(activeThreadId, trimmed);
    await callAgent(trimmed);
  }

  function handleNewChat() {
    createThread();
    setSidebarOpen(false);
  }

  function handleSelectThread(id) {
    selectThread(id);
    setSidebarOpen(false);
  }

  const messages = activeThread?.messages ?? [];
  const lastAssistantIndex = messages
    .map((m) => m.role)
    .lastIndexOf("assistant");

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-black">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        onDeleteThread={deleteThread}
        onRenameThread={renameThread}
        onClearAll={clearAllThreads}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
            className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-ink"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-base">
              <SparkleIcon className="h-3.5 w-3.5" />
            </span>
            <h1 className="font-display text-sm font-semibold lg:text-ink sm:text-base">
              AI Car Advisor
            </h1>
          </div>

          <button
            onClick={handleNewChat}
            aria-label="New chat"
            className="ml-auto flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink transition hover:border-muted lg:hidden"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            New
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
            {messages.length === 0 && (
              <div className="mt-16 text-center">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-base">
                  <SparkleIcon className="h-6 w-6" />
                </span>
                <h2 className="font-display text-xl font-semibold text-ink">
                  What car are you looking for?
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                  Tell me your budget, body type, or use case — I&apos;ll help
                  you narrow it down.
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <ChatMessage
                key={i}
                role={m.role}
                content={m.content}
                isLastAssistant={
                  m.role === "assistant" && i === lastAssistantIndex
                }
                onRegenerate={handleRegenerate}
                loading={loading}
              />
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-base">
                  <SparkleIcon className="h-4 w-4" />
                </span>
                <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-surface px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
            <div className="mb-2 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          </div>
        )}

        <div className="border-t border-border bg-black/60 px-4 py-4 backdrop-blur sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <ChatInput onSend={handleSend} disabled={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
