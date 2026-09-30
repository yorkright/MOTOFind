"use client";

import { useState } from "react";
import { SendIcon, SparkleIcon } from "./icons";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-full border border-border bg-surface/90 px-2 py-2 shadow-lg backdrop-blur-sm sm:gap-3 sm:px-3"
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
        <SparkleIcon className="h-4 w-4" />
      </span>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What's on your mind?"
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent text-sm lg:text-ink placeholder:text-muted focus:outline-none disabled:opacity-50 sm:text-base"
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent text-base transition hover:brightness-110 disabled:opacity-40"
      >
        <SendIcon className="h-4 w-4" />
      </button>
    </form>
  );
}