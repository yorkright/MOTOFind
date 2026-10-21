"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";

const FALLBACK_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9GBCZPluctAf5H7XoRDynVkKm6ki1UuwaHstwAMvF8muMf3JWG3G43PnO&s=10";

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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-950 px-4 pb-16 pt-24 text-white">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <section className="rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950/40 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  Live India Car Market Updates
                </span>

                <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  India Car Market News
                </h1>

                <p className="mt-3 max-w-2xl text-gray-400">
                  Stay updated with the latest Indian car launches, EVs, price
                  changes, sales data and automobile industry news. Select any
                  story and ask AI to explain it.
                </p>

                {lastUpdated && (
                  <p className="mt-3 text-sm text-gray-500">
                    Last updated: {formatDate(lastUpdated)}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={loadNews}
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading ? "Refreshing…" : "Refresh News"}
                </button>

                <a
                  href="#saved-news"
                  className="rounded-xl border border-gray-700 px-5 py-3 text-center text-sm font-semibold text-gray-200 transition hover:bg-gray-800"
                >
                  Saved ({savedArticles.length})
                </a>
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="mt-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => setActiveTopic(topic.value)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeTopic === topic.value
                        ? "bg-blue-600 text-white"
                        : "border border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-600 hover:bg-gray-800"
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-80">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search Tata, EV, SUV, price…"
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
                />

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  🔍
                </span>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Showing {filteredArticles.length} of {articles.length} articles
            </p>
          </section>

          {/* Loading skeletons */}
          {loading && (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-2xl border border-gray-800 bg-gray-900"
                >
                  <div className="h-44 w-full bg-gray-800" />

                  <div className="space-y-3 p-5">
                    <div className="h-3 w-24 rounded bg-gray-800" />
                    <div className="h-4 w-full rounded bg-gray-800" />
                    <div className="h-4 w-4/5 rounded bg-gray-800" />
                    <div className="h-3 w-full rounded bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
              <p className="font-medium text-red-300">{error}</p>

              <button
                onClick={loadNews}
                className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredArticles.length === 0 && (
            <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
              <p className="text-lg font-medium">No news found</p>

              <p className="mt-2 text-gray-400">
                Try another topic or search with a different keyword.
              </p>

              <button
                onClick={() => {
                  setActiveTopic("all");
                  setSearchQuery("");
                }}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-500"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* News grid */}
          {!loading && filteredArticles.length > 0 && (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image || FALLBACK_IMAGE}
                      alt={article.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    <button
                      onClick={() => toggleSaveArticle(article)}
                      className={`absolute right-3 top-3 rounded-lg px-3 py-1.5 text-xs font-semibold backdrop-blur transition ${
                        isSaved(article)
                          ? "bg-yellow-500 text-black"
                          : "bg-black/60 text-white hover:bg-black/80"
                      }`}
                    >
                      {isSaved(article) ? "★ Saved" : "☆ Save"}
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                        {article.source}
                      </span>

                      {article.publishedAt && (
                        <span className="text-xs text-gray-500">
                          {formatDate(article.publishedAt)}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug">
                      {article.title}
                    </h2>

                    {article.snippet && (
                      <p className="mt-2 line-clamp-3 text-sm text-gray-400">
                        {article.snippet}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                      >
                        Read original →
                      </a>

                      <button
                        onClick={() => openAiAssistant(article)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium transition hover:bg-blue-500"
                      >
                        Ask AI
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Saved news */}
          {savedArticles.length > 0 && (
            <section id="saved-news" className="mt-14">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Saved News</h2>

                <button
                  onClick={() => {
                    setSavedArticles([]);
                    localStorage.setItem("savedCarNews", "[]");
                  }}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-800"
                >
                  Clear All
                </button>
              </div>

              <div className="mt-5 flex gap-3 overflow-x-auto pb-3">
                {savedArticles.map((article) => (
                  <div
                    key={`saved-${article.id}`}
                    className="w-72 shrink-0 rounded-2xl border border-gray-800 bg-gray-900 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-blue-400">
                      {article.source}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-sm font-semibold">
                      {article.title}
                    </h3>

                    <div className="mt-4 flex items-center justify-between">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-400 hover:text-blue-300"
                      >
                        Read →
                      </a>

                      <button
                        onClick={() => toggleSaveArticle(article)}
                        className="text-xs font-medium text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI assistant */}
          {selectedArticle && (
            <section className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
              <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-800 bg-gray-900 shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-gray-800 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-blue-400">
                      AI News Assistant
                    </p>

                    <h2 className="mt-1 line-clamp-2 text-lg font-semibold">
                      {selectedArticle.title}
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Source: {selectedArticle.source}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-[45vh] space-y-4 overflow-y-auto p-5">
                  {messages.length === 0 && (
                    <div className="rounded-2xl bg-gray-950 p-5">
                      <p className="text-sm text-gray-300">
                        Ask anything about this news. For example:
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {QUICK_QUESTIONS.map((quickQuestion) => (
                          <button
                            key={quickQuestion}
                            onClick={() => setQuestion(quickQuestion)}
                            className="rounded-full border border-gray-700 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-gray-800"
                          >
                            {quickQuestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        message.role === "user"
                          ? "ml-auto bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  ))}

                  {asking && (
                    <div className="max-w-[85%] rounded-2xl bg-gray-800 px-4 py-3 text-sm text-gray-400">
                      AI is reading the article and searching for context…
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    askAboutArticle(selectedArticle);
                  }}
                  className="border-t border-gray-800 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      placeholder="Ask a follow-up question…"
                      className="flex-1 rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    />

                    <button
                      type="submit"
                      disabled={asking || !question.trim()}
                      className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-50"
                    >
                      {asking ? "Thinking…" : "Ask AI"}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
