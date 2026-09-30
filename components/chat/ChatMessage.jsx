"use client";

import { useState } from "react";
import { CopyIcon, RegenerateIcon, SparkleIcon, ThumbsDownIcon, ThumbsUpIcon } from "./icons";
import MarkdownRenderer from "./MarkdownRenderer";

export default function ChatMessage({ role, content, isLastAssistant, onRegenerate, loading }) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — non-critical, fail silently.
    }
  }

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-2">
        <p className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-right text-sm font-medium leading-relaxed text-white sm:text-base">
          {content}
        </p>
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-accent text-xs font-semibold text-white">
          You
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white">
        <SparkleIcon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-accent">
          Arclight
        </div>

        <div className="rounded-2xl rounded-tl-sm border-2 border-accent/40 bg-[#111111] px-4 py-3">
          <MarkdownRenderer content={content} />
        </div>

        <div className="mt-3 flex items-center gap-1 text-white/60">
          <button
            onClick={() => setVote(vote === "up" ? null : "up")}
            aria-label="Good response"
            className={`rounded-lg p-1.5 transition hover:bg-accent/15 hover:text-white ${
              vote === "up" ? "text-accent" : ""
            }`}
          >
            <ThumbsUpIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setVote(vote === "down" ? null : "down")}
            aria-label="Bad response"
            className={`rounded-lg p-1.5 transition hover:bg-accent/15 hover:text-white ${
              vote === "down" ? "text-accent" : ""
            }`}
          >
            <ThumbsDownIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCopy}
            aria-label="Copy response"
            className="rounded-lg p-1.5 transition hover:bg-accent/15 hover:text-white"
          >
            <CopyIcon className="h-3.5 w-3.5" />
          </button>
          {isLastAssistant && (
            <button
              onClick={onRegenerate}
              disabled={loading}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition hover:bg-accent/15 hover:text-white disabled:opacity-50"
            >
              <RegenerateIcon className="h-3.5 w-3.5" />
              Regenerate
            </button>
          )}
          {copied && <span className="text-xs font-medium text-accent">Copied</span>}
        </div>
      </div>
    </div>
  );
}