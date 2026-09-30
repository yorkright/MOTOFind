"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloseIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  EditIcon,
  SettingsIcon,
  SparkleIcon,
} from "./icons";

export default function Sidebar({
  open,
  onClose,
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  onRenameThread,
  onClearAll,
}) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const filtered = query.trim()
    ? threads.filter((t) => t.title.toLowerCase().includes(query.trim().toLowerCase()))
    : threads;

  function startEdit(thread) {
    setEditingId(thread.id);
    setEditValue(thread.title);
  }

  function commitEdit(id) {
    onRenameThread(id, editValue);
    setEditingId(null);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            aria-label="Close sidebar"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/*
        overflow-hidden here is load-bearing: on desktop the sidebar collapses
        via width -> 0 rather than translate, so anything that overflows the
        280px inner content needs to be clipped by THIS element, not just the
        inner div, or it bleeds into the main chat column while animating/closed.
      */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col overflow-hidden border-r border-border bg-surface transition-all duration-300 ease-out lg:static lg:z-auto lg:h-full lg:flex-shrink-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${open ? "lg:w-[280px]" : "lg:w-0 lg:border-r-0"}`}
      >
        <div className="flex h-full min-w-[280px] flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5">
            <a href="/" 
            className="font-display text-lg font-semibold tracking-wide text-accent">
              Motofind
            </a>
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="rounded-lg p-1.5 text-muted transition hover:bg-black/20 hover:text-ink lg:hidden"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 px-5">
            <button
              onClick={onNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-base transition hover:brightness-110"
            >
              <PlusIcon className="h-4 w-4" />
              New chat
            </button>
          </div>

          <div className="mt-3 px-5">
            <div className="flex items-center gap-2 rounded-full border border-border bg-black/20 px-3 py-2">
              <SearchIcon className="h-4 w-4 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats"
                className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between px-5">
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
              Your conversations
            </span>
            <button
              onClick={onClearAll}
              className="font-mono text-[10px] uppercase tracking-wide text-signal hover:underline"
            >
              Clear all
            </button>
          </div>

          <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
            {filtered.length === 0 && (
              <p className="px-2 py-6 text-center text-xs text-muted">No conversations found.</p>
            )}

            {filtered.map((thread) => {
              const isActive = thread.id === activeThreadId;
              return (
                <div
                  key={thread.id}
                  className={`group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive ? "bg-accent/15 text-ink" : "text-muted hover:bg-black/20 hover:text-ink"
                  }`}
                >
                  {editingId === thread.id ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitEdit(thread.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit(thread.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full bg-transparent text-sm text-ink focus:outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => onSelectThread(thread.id)}
                      className="flex-1 truncate text-left"
                      title={thread.title}
                    >
                      {thread.title}
                    </button>
                  )}

                  <div className="hidden items-center gap-1 group-hover:flex">
                    <button
                      onClick={() => startEdit(thread)}
                      aria-label="Rename chat"
                      className="rounded-md p-1 text-muted hover:bg-black/30 hover:text-ink"
                    >
                      <EditIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteThread(thread.id)}
                      aria-label="Delete chat"
                      className="rounded-md p-1 text-muted hover:bg-black/30 hover:text-red-400"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {isActive && (
                    <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-accent" />
                  )}
                </div>
              );
            })}
          </nav>

          <div className="space-y-1 border-t border-border px-3 py-3">
            <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-black/20 hover:text-ink">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </button>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-base">
                <SparkleIcon className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm text-ink">Guest user</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}