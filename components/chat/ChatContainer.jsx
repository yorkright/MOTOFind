"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { motion } from "framer-motion";
import { MenuIcon, PlusIcon, SparkleIcon } from "./icons";
import { useChatThreads } from "@/lib/chat/useChatThreads";
import RoadDivider from "../landing/RoadDivider";
import { Heading5 } from "lucide-react";

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
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState("");
  const scrollRef = useRef(null);
  const [articles, setArticles] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function loadNews() {
    try {
      setNewsLoading(true);
      setNewsError("");

      const res = await fetch("/api/news");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Fiailed to Load News");
      }

      setArticles(Array.isArray(data.articles) ? data.articles : []);
      setLastUpdated(data.lastUpdated || null);
    } catch (err) {
      setNewsError(err.message || "Failed to load news.");
      setArticles([]);
    } finally {
      setNewsLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

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

  // Offers panel: base look (always applied)
  const asideBase =
    "mx-auto mt-10 w-full max-w-sm px-4 flex flex-col gap-4 rounded-2xl p-5 bg-slate-900/5 border border-slate-200 dark:bg-zinc-900/50 dark:border-zinc-800 text-left";

  // Offers panel: floating-on-the-right behaviour.
  // - Sidebar closed: floats from `xl` up (original behaviour).
  // - Sidebar open: the chat area is narrower, so it only floats on very wide
  //   screens (1800px+). Below that it stays in normal flow under the chat
  //   input, so it can never overlap the chat area.
  const asideFloating = sidebarOpen
    ? "min-[1800px]:mt-0 min-[1800px]:max-w-none min-[1800px]:fixed min-[1800px]:right-6 min-[1800px]:top-28 min-[1800px]:z-10 min-[1800px]:w-72"
    : "xl:mt-0 xl:max-w-none xl:fixed xl:right-4 2xl:right-6 xl:top-28 xl:z-10 xl:w-64 2xl:w-72";

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
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-accent"
            >
              <motion.div
                className="h-5 w-5"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <MenuIcon className="h-5 w-5" />
              </motion.div>
            </button>
          )}

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
          <div className="mx-auto flex w-full  max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
            {messages.length === 0 && (
              <>
                {/* ============ SECTION 1: Heading + Chat (original layout) ============ */}
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
                  <br />
                  <div className="px-4 py-4 backdrop-blur sm:px-6">
                    <RoadDivider />
                    <div className="mx-auto w-full max-w-3xl mt-6 px-4 sm:px-6">
                      <ChatInput onSend={handleSend} disabled={loading} />
                    </div>
                  </div>
                </div>

                {/* ============ SECTION 2: Offers (small, right side of page) ============ */}
                <aside className={`${asideBase} ${asideFloating}`}>
                  <h3 className="px-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-zinc-400">
                    Offers/Updates
                  </h3>

                  {newsLoading && (
                    <p className="text-sm text-muted">Loading articles...</p>
                  )}
                  {newsError && (
                    <p className="text-sm text-red-500">{newsError}</p>
                  )}
                  {!newsLoading && !newsError && articles.length === 0 && (
                    <p className="text-sm text-muted">No articles available.</p>
                  )}

                  {articles.slice(0, 3).map((article, index) => (
                    <article
                      key={article.url || article.title || index}
                      className="group rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-amber-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-amber-500/40"
                    >
                      <a
                        href={article.url || "#"}
                        target={article.url ? "_blank" : undefined}
                        rel={article.url ? "noopener noreferrer" : undefined}
                        className="flex flex-col gap-1.5"
                      >
                        <span className="text-[9px] font-bold tracking-widest text-amber-600 uppercase dark:text-amber-400">
                          {article.source?.name || article.source || "Car news"}
                        </span>
                        <h4 className="text-xs font-semibold leading-snug text-slate-800 dark:text-zinc-100">
                          {article.title || "Untitled article"}
                        </h4>
                        {article.description && (
                          <p className="line-clamp-3 text-[11px] leading-snug text-muted">
                            {article.description}
                          </p>
                        )}
                      </a>
                    </article>
                  ))}

                  {lastUpdated && (
                    <p className="text-[10px] text-muted">
                      Updated {new Date(lastUpdated).toLocaleString()}
                    </p>
                  )}

                   <a href="/news" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white transition hover:bg-black/20 hover:text-accent">
              <SparkleIcon className="h-4 w-4 text-accent" />
              More
            </a>
                </aside>
              </>
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

        {messages.length > 0 && (
          <div className="border-t border-border bg-black/60 px-4 py-4 backdrop-blur sm:px-6">
            <div className="mx-auto w-full max-w-3xl">
              <ChatInput onSend={handleSend} disabled={loading} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
