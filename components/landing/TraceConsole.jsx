"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SCRIPT = [
  { kind: "user", text: "Best 7-seater SUV under ₹18L with good mileage?" },
  { kind: "thought", text: "Needs current listings, not memorized specs." },
  { kind: "action", text: 'search_listings("7-seat SUV under 1800000 INR")' },
  { kind: "observation", text: "Safari, Hector, Alcazar, XL6 in range." },
  { kind: "action", text: 'compare_specs(["Safari","Hector","Alcazar","XL6"])' },
  { kind: "observation", text: "Alcazar: 20.4 kmpl, best-in-class boot with 3rd row up." },
  { kind: "answer", text: "Hyundai Alcazar — strongest mileage-to-space ratio here." },
];

const LABEL = {
  user: "YOU",
  thought: "THOUGHT",
  action: "ACTION",
  observation: "OBSERVATION",
  answer: "ANSWER",
};

const COLOR = {
  user: "text-ink",
  thought: "text-muted",
  action: "text-signal",
  observation: "text-accent",
  answer: "text-ink",
};

export default function TraceConsole() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= SCRIPT.length) {
      const resetTimer = setTimeout(() => setVisibleCount(0), 2200);
      return () => clearTimeout(resetTimer);
    }
    const delay = SCRIPT[visibleCount].kind === "user" ? 600 : 850;
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), delay);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
        <span className="ml-3 font-mono text-xs text-muted">agent-trace.log</span>
      </div>

      <div className="min-h-[220px] space-y-3 overflow-x-auto px-4 py-5 font-mono text-xs leading-relaxed sm:min-h-[280px] sm:px-5 sm:py-6 sm:text-[13px]">
        <AnimatePresence mode="popLayout">
          {SCRIPT.slice(0, visibleCount).map((line, i) => (
            <motion.div
              key={`${line.kind}-${i}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="whitespace-pre-wrap break-words"
            >
              <span className={`text-[10px] tracking-wide sm:text-[11px] ${COLOR[line.kind]}`}>
                {LABEL[line.kind]}
              </span>
              <span className="ml-2 text-ink/90">{line.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {visibleCount < SCRIPT.length && (
          <span className="inline-block h-4 w-2 animate-blink bg-muted align-middle" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
