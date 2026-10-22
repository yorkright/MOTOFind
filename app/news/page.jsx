"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/landing/Navbar";

const FALLBACK_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9GBCZPluctAf5H7XoRDynVkKm6ki1UuwaHstwAMvF8muMf3JWG3G43PnO&s=10";

/* ------------------------------------------------------------------
   MOTOFIND THEME — change colours here only.
   Values are "R G B" channels so Tailwind opacity (/0.15) still works.
------------------------------------------------------------------- */
const THEME = {
  "--mf-bg": "11 11 13", // page background
  "--mf-surface": "20 20 23", // cards
  "--mf-surface-2": "30 30 35", // raised / bubbles / skeletons
  "--mf-border": "44 44 51",
  "--mf-border-strong": "68 68 78",
  "--mf-accent": "249 115 22", // primary accent (buttons, active chip)
  "--mf-accent-2": "251 191 36", // gradient end / secondary accent
  "--mf-accent-text": "253 164 90", // accent used as TEXT on dark
  "--mf-on-accent": "24 12 2", // text on top of accent buttons
  "--mf-fg": "250 250 249", // headings
  "--mf-body": "214 211 209", // body copy
  "--mf-muted": "168 162 158", // dates, captions
};

const BTN_PRIMARY =
  "bg-[rgb(var(--mf-accent))] text-[rgb(var(--mf-on-accent))] font-semibold shadow-[0_8px_24px_-8px_rgb(var(--mf-accent)/0.55)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50";

const BTN_GHOST =
  "border border-[rgb(var(--mf-border-strong))] text-[rgb(var(--mf-body))] font-medium transition hover:bg-[rgb(var(--mf-surface-2))] active:scale-[0.98]";

const INPUT_BASE =
  "text-base text-[rgb(var(--mf-fg))] outline-none transition placeholder:text-[rgb(var(--mf-muted))] focus:border-[rgb(var(--mf-accent))] focus:ring-2 focus:ring-[rgb(var(--mf-accent)/0.3)] sm:text-sm";

const TOPICS = [
  { label: "All News", value: "all" },
  { label: "Launches", value: "launch" },
  { label: "EV & Hybrid", value: "ev" },
  { label: "Prices", value: "price" },
  { label: "Sales", value: "sales" },
  { label: "Tata", value: "tata" },
  { label: "Maruti", value: "maruti" },
  { label: "Mahindra", value: "mahindra" },
];

const QUICK_QUESTIONS = [
  "Explain this news in simple words",
  "Why is this important for Indian car buyers?",
  "What is the expected price in India?",
  "Which cars are its competitors?",
];

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BookmarkIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

export default function CarNewsPage() {
  const [articles, setArticles] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTopic, setActiveTopic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedArticles, setSavedArticles] = useState([]);

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  const messagesEndRef = useRef(null);

  async function loadNews() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/news");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load news");
      }

      setArticles(Array.isArray(data.articles) ? data.articles : []);
      setLastUpdated(data.lastUpdated || null);
    } catch (err) {
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
    loadSavedArticles();
  }, []);

  // Lock background scroll + close on Escape while the AI sheet is open
  useEffect(() => {
    if (!selectedArticle) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") setSelectedArticle(null);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedArticle]);

  // Keep the latest chat message in view
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, asking]);

  function loadSavedArticles() {
    try {
      const saved = JSON.parse(localStorage.getItem("savedCarNews") || "[]");

      setSavedArticles(Array.isArray(saved) ? saved : []);
    } catch {
      setSavedArticles([]);
    }
  }

  function isSaved(article) {
    return savedArticles.some((item) => item.id === article.id);
  }

  function toggleSaveArticle(article) {
    const updated = isSaved(article)
      ? savedArticles.filter((item) => item.id !== article.id)
      : [...savedArticles, article];

    setSavedArticles(updated);
    localStorage.setItem("savedCarNews", JSON.stringify(updated));
  }

  function matchesTopic(article, topic) {
    const text = `${article.title} ${article.snippet}`.toLowerCase();

    if (topic === "all") return true;

    if (topic === "ev") {
      return (
        text.includes("ev") ||
        text.includes("electric") ||
        text.includes("hybrid")
      );
    }

    return text.includes(topic);
  }

  const filteredArticles = articles
    .filter((article) => matchesTopic(article, activeTopic))
    .filter((article) => {
      if (!searchQuery.trim()) return true;

      const text = `${article.title} ${article.snippet}`.toLowerCase();

      return text.includes(searchQuery.toLowerCase());
    });

  function openAiAssistant(article) {
    setSelectedArticle(article);
    setMessages([]);
    setQuestion("");
  }

  async function askAboutArticle(article) {
    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      content: question,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setQuestion("");
    setAsking(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleUrl: article.url,
          articleTitle: article.title,
          question,
          history: updatedMessages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.message,
        },
      ]);
    } finally {
      setAsking(false);
    }
  }

  async function loadArticleImage(event, article) {
    const imageElement = event.currentTarget;

    if (article.image) return;

    if (imageElement.dataset.checked === "true") return;

    imageElement.dataset.checked = "true";

    try {
      const res = await fetch(
        `/api/news/image?url=${encodeURIComponent(article.url)}`,
      );

      const data = await res.json();

      if (data.image && imageElement.isConnected) {
        imageElement.src = data.image;
      }
    } catch {
      if (imageElement.isConnected) {
        imageElement.src = FALLBACK_IMAGE;
      }
    }
  }

  return (
    <>
      <Navbar />

      <main
        style={THEME}
        className="relative isolate min-h-[100dvh] overflow-x-clip bg-[rgb(var(--mf-bg))] px-4 pb-20 pt-24 text-[rgb(var(--mf-body))] antialiased selection:bg-[rgb(var(--mf-accent)/0.35)] sm:px-6 sm:pt-28"
      >
        {/* Ambient background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden"
        >
          <div className="absolute -top-44 left-1/2 h-[420px] w-[720px] max-w-[140vw] -translate-x-1/2 rounded-full bg-[rgb(var(--mf-accent)/0.16)] blur-[130px]" />
          <div className="absolute right-0 top-24 h-[260px] w-[260px] rounded-full bg-[rgb(var(--mf-accent-2)/0.09)] blur-[110px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--mf-fg)/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--mf-fg)/0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        </div>

        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl border border-[rgb(var(--mf-border))] bg-gradient-to-br from-[rgb(var(--mf-surface))] via-[rgb(var(--mf-surface))] to-[rgb(var(--mf-accent)/0.12)] p-5 sm:p-8"
          >
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--mf-accent)/0.35)] bg-[rgb(var(--mf-accent)/0.12)] px-3 py-1 text-[13px] font-medium text-[rgb(var(--mf-accent-text))]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[rgb(var(--mf-accent))] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[rgb(var(--mf-accent))]" />
                  </span>
                  Live India Car Market Updates
                </span>

                <h1 className="mt-4 text-balance text-[2rem] font-extrabold leading-[1.1] tracking-tight text-[rgb(var(--mf-fg))] sm:text-4xl lg:text-5xl">
                  India Car{" "}
                  <span className="bg-gradient-to-r from-[rgb(var(--mf-accent))] to-[rgb(var(--mf-accent-2))] bg-clip-text text-transparent">
                    Market News
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-7 text-white ">
                  Stay updated with the latest Indian car launches, EVs, price
                  changes, sales data and automobile industry news. Select any
                  story and ask Motofind AI to explain it.
                </p>

                {lastUpdated && (
                  <p className="mt-3 text-[13px] text-[rgb(var(--mf-muted))] sm:text-sm">
                    Last updated:{" "}
                    <span className="font-medium text-[rgb(var(--mf-body))]">
                      {formatDate(lastUpdated)}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-3 sm:flex">
                <button
                  onClick={loadNews}
                  disabled={loading}
                  className={`rounded-xl px-5 py-3 text-sm ${BTN_PRIMARY}`}
                >
                  {loading ? "Refreshing…" : "Refresh News"}
                </button>

                <a
                  href="#saved-news"
                  className={`rounded-xl px-5 py-3 text-center text-sm ${BTN_GHOST}`}
                >
                  Saved ({savedArticles.length})
                </a>
              </div>
            </div>
          </motion.section>

          {/* Filters */}
          <section className="mt-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => setActiveTopic(topic.value)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeTopic === topic.value
                        ? "bg-[rgb(var(--mf-accent))] text-[rgb(var(--mf-on-accent))] shadow-[0_8px_24px_-8px_rgb(var(--mf-accent)/0.55)]"
                        : "border border-[rgb(var(--mf-border))] bg-[rgb(var(--mf-surface))] text-[rgb(var(--mf-body))] hover:border-[rgb(var(--mf-accent)/0.5)] hover:text-[rgb(var(--mf-fg))]"
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-80">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--mf-muted))]"
                >
                  🔍
                </span>

                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search Tata, EV, SUV, price…"
                  className={`w-full rounded-xl border border-[rgb(var(--mf-border-strong))] bg-[rgb(var(--mf-surface))] py-3 pl-11 pr-4 ${INPUT_BASE}`}
                />
              </div>
            </div>

            <p className="mt-3 text-sm text-[rgb(var(--mf-muted))]">
              Showing{" "}
              <span className="font-semibold text-[rgb(var(--mf-accent-text))]">
                {filteredArticles.length}
              </span>{" "}
              of {articles.length} articles
            </p>
          </section>

          {/* Loading skeletons */}
          {loading && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-2xl border border-[rgb(var(--mf-border))] bg-[rgb(var(--mf-surface))]"
                >
                  <div className="aspect-[16/9] w-full bg-[rgb(var(--mf-surface-2))]" />

                  <div className="space-y-3 p-5">
                    <div className="h-3 w-24 rounded bg-[rgb(var(--mf-surface-2))]" />
                    <div className="h-4 w-full rounded bg-[rgb(var(--mf-surface-2))]" />
                    <div className="h-4 w-4/5 rounded bg-[rgb(var(--mf-surface-2))]" />
                    <div className="h-3 w-full rounded bg-[rgb(var(--mf-surface-2))]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
              <p className="break-words text-[15px] font-medium leading-relaxed text-red-200">
                {error}
              </p>

              <button
                onClick={loadNews}
                className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredArticles.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[rgb(var(--mf-border))] bg-[rgb(var(--mf-surface))] p-8 text-center sm:p-10">
              <p className="text-lg font-semibold text-[rgb(var(--mf-fg))]">
                No news found
              </p>

              <p className="mt-2 text-[15px] leading-relaxed text-[rgb(var(--mf-body))]">
                Try another topic or search with a different keyword.
              </p>

              <button
                onClick={() => {
                  setActiveTopic("all");
                  setSearchQuery("");
                }}
                className={`mt-5 rounded-lg px-4 py-2 text-sm ${BTN_PRIMARY}`}
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* News grid */}
          {!loading && filteredArticles.length > 0 && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    delay: Math.min(index * 0.04, 0.3),
                  }}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[rgb(var(--mf-border))] bg-[rgb(var(--mf-surface))] transition-colors hover:border-[rgb(var(--mf-accent)/0.5)] hover:shadow-[0_16px_40px_-16px_rgb(var(--mf-accent)/0.3)]"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[rgb(var(--mf-surface-2))]">
                    <img
                      src={article.image || FALLBACK_IMAGE}
                      alt={article.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      onLoad={(event) => loadArticleImage(event, article)}
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgb(var(--mf-surface))]/85 via-transparent to-transparent" />

                    <button
                      onClick={() => toggleSaveArticle(article)}
                      aria-label={
                        isSaved(article) ? "Remove from saved" : "Save article"
                      }
                      aria-pressed={isSaved(article)}
                      className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition active:scale-95 ${
                        isSaved(article)
                          ? "border-[rgb(var(--mf-accent))] bg-[rgb(var(--mf-accent))] text-[rgb(var(--mf-on-accent))]"
                          : "border-white/10 bg-black/55 text-[rgb(var(--mf-fg))] hover:bg-black/75"
                      }`}
                    >
                      <BookmarkIcon filled={isSaved(article)} />
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="max-w-[55%] truncate rounded-full bg-[rgb(var(--mf-accent)/0.14)] px-3 py-1 text-[13px] font-semibold text-[rgb(var(--mf-accent-text))]">
                        {article.source}
                      </span>

                      {article.publishedAt && (
                        <span className="truncate text-[13px] text-[rgb(var(--mf-muted))]">
                          {formatDate(article.publishedAt)}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 line-clamp-2 text-balance break-words text-[1.0625rem] font-semibold leading-snug tracking-tight text-[rgb(var(--mf-fg))] sm:text-lg">
                      {article.title}
                    </h2>

                    {article.snippet && (
                      <p className="mt-2 line-clamp-3 text-pretty break-words text-[15px] leading-relaxed text-[rgb(var(--mf-body))]">
                        {article.snippet}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[rgb(var(--mf-accent-text))] transition hover:brightness-125"
                      >
                        Read original →
                      </a>

                      <button
                        onClick={() => openAiAssistant(article)}
                        className={`rounded-lg px-4 py-2 text-sm ${BTN_PRIMARY}`}
                      >
                        Ask AI
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Saved news */}
          {savedArticles.length > 0 && (
            <section id="saved-news" className="mt-14 scroll-mt-28">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold tracking-tight text-[rgb(var(--mf-fg))] sm:text-2xl">
                  Saved News
                </h2>

                <button
                  onClick={() => {
                    setSavedArticles([]);
                    localStorage.setItem("savedCarNews", "[]");
                  }}
                  className={`rounded-lg px-4 py-2 text-sm ${BTN_GHOST}`}
                >
                  Clear All
                </button>
              </div>

              <div className="-mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
                {savedArticles.map((article) => (
                  <div
                    key={`saved-${article.id}`}
                    className="w-[75vw] max-w-72 shrink-0 snap-start rounded-2xl border border-[rgb(var(--mf-border))] bg-[rgb(var(--mf-surface))] p-4 sm:w-72"
                  >
                    <p className="truncate text-[13px] font-semibold uppercase tracking-wider text-[rgb(var(--mf-accent-text))]">
                      {article.source}
                    </p>

                    <h3 className="mt-2 line-clamp-2 break-words text-[15px] font-semibold leading-snug text-[rgb(var(--mf-fg))]">
                      {article.title}
                    </h3>

                    <div className="mt-4 flex items-center justify-between">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[rgb(var(--mf-accent-text))] hover:brightness-125"
                      >
                        Read →
                      </a>

                      <button
                        onClick={() => toggleSaveArticle(article)}
                        className="text-sm font-semibold text-red-300 hover:text-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* AI assistant */}
        <AnimatePresence>
          {selectedArticle && (
            <motion.section
              key="ai-assistant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
              onClick={() => setSelectedArticle(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Motofind AI News Assistant"
            >
              <motion.div
                initial={{ y: 40, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 40, opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                onClick={(event) => event.stopPropagation()}
                className="flex h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-[rgb(var(--mf-border))] bg-[rgb(var(--mf-surface))] shadow-2xl sm:h-auto sm:max-h-[85dvh] sm:rounded-3xl"
              >
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[rgb(var(--mf-border))] p-4 sm:p-5">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold uppercase tracking-wider text-[rgb(var(--mf-accent-text))]">
                      Motofind AI · News Assistant
                    </p>

                    <h2 className="mt-1.5 line-clamp-2 break-words text-base font-semibold leading-snug text-[rgb(var(--mf-fg))] sm:text-lg">
                      {selectedArticle.title}
                    </h2>

                    <p className="mt-1 truncate text-[13px] text-[rgb(var(--mf-muted))]">
                      Source:{" "}
                      <span className="font-medium text-[rgb(var(--mf-body))]">
                        {selectedArticle.source}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedArticle(null)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-sm ${BTN_GHOST}`}
                  >
                    Close
                  </button>
                </div>

                {/* Messages */}
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:min-h-[220px] sm:p-5">
                  {messages.length === 0 && (
                    <div className="rounded-2xl bg-[rgb(var(--mf-bg))] p-4 sm:p-5">
                      <p className="text-[15px] leading-relaxed text-[rgb(var(--mf-body))]">
                        Ask anything about this news. For example:
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {QUICK_QUESTIONS.map((quickQuestion) => (
                          <button
                            key={quickQuestion}
                            onClick={() => setQuestion(quickQuestion)}
                            className="rounded-full border border-[rgb(var(--mf-border-strong))] px-3.5 py-2 text-left text-[13px] font-medium leading-snug text-[rgb(var(--mf-body))] transition hover:border-[rgb(var(--mf-accent)/0.6)] hover:bg-[rgb(var(--mf-accent)/0.08)] hover:text-[rgb(var(--mf-fg))]"
                          >
                            {quickQuestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[85%] ${
                        message.role === "user"
                          ? "ml-auto rounded-br-md bg-[rgb(var(--mf-accent))] text-[rgb(var(--mf-on-accent))]"
                          : "rounded-bl-md border border-[rgb(var(--mf-border))] bg-[rgb(var(--mf-surface-2))] text-[rgb(var(--mf-fg))]"
                      }`}
                    >
                      <p
                        className={`whitespace-pre-wrap break-words text-[15px] leading-7 ${
                          message.role === "user" ? "font-medium" : ""
                        }`}
                      >
                        {message.content}
                      </p>
                    </motion.div>
                  ))}

                  {asking && (
                    <div className="flex max-w-[92%] items-center gap-3 rounded-2xl rounded-bl-md border border-[rgb(var(--mf-border))] bg-[rgb(var(--mf-surface-2))] px-4 py-3 text-[15px] leading-relaxed text-[rgb(var(--mf-body))] sm:max-w-[85%]">
                      <span className="flex shrink-0 gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[rgb(var(--mf-accent))] [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[rgb(var(--mf-accent))] [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[rgb(var(--mf-accent))]" />
                      </span>
                      AI is reading the article and searching for context…
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    askAboutArticle(selectedArticle);
                  }}
                  className="shrink-0 border-t border-[rgb(var(--mf-border))] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      placeholder="Ask a follow-up question…"
                      className={`min-w-0 flex-1 rounded-xl border border-[rgb(var(--mf-border-strong))] bg-[rgb(var(--mf-bg))] px-4 py-3 ${INPUT_BASE}`}
                    />

                    <button
                      type="submit"
                      disabled={asking || !question.trim()}
                      className={`rounded-xl px-5 py-3 text-sm ${BTN_PRIMARY}`}
                    >
                      {asking ? "Thinking…" : "Ask AI"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
