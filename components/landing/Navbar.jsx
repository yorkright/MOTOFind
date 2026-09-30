"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Menu, X } from "lucide-react";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-base/80 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a
          href="#top"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 font-display text-base font-semibold text-ink sm:text-lg"
        >
          <Car className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} aria-hidden="true" />
          Motofind
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-ink">
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="/agent"
          className="hidden rounded-full bg-ink px-4 py-2 text-sm font-medium text-base transition hover:bg-accent md:inline-block"
        >
          Open the agent
        </a>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border/60 bg-base md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm text-muted transition hover:bg-surface hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/agent"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-accent px-4 py-2.5 text-center text-sm font-semibold text-base"
              >
                Open the agent
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
