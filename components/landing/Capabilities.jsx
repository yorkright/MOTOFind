"use client";

import { motion } from "framer-motion";
import { Search, Wallet, Radio, ShieldCheck } from "lucide-react";

const ITEMS = [
  {
    icon: Search,
    title: "Live listings search",
    body: "Pulls current inventory and prices when a recommendation depends on what's actually available today.",
  },
  {
    icon: Wallet,
    title: "True cost calculator",
    body: "On-road price, EMI, and running cost run through real arithmetic — not a language model's approximation of one.",
  },
  {
    icon: Radio,
    title: "Streamed, not batched",
    body: "Every listing checked and spec compared arrives the moment it's ready — no spinner hiding what's actually happening.",
  },
  {
    icon: ShieldCheck,
    title: "Rate-limited & sandboxed",
    body: "Server-side API keys, capped tool loops, and per-user throttling. Built to survive real showroom traffic, not just a demo.",
  },
];

export default function Capabilities() {
  return (
    <section id="capabilities" className="border-t border-border/60 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="font-display text-2xl font-semibold text-ink sm:text-3xl lg:text-4xl"
        >
          Built for the messy real world.
        </motion.h2>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6">
          {ITEMS.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-surface p-5 sm:p-7"
            >
              <Icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
              <h3 className="mt-3 font-display text-base font-semibold text-ink sm:mt-4 sm:text-lg">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
