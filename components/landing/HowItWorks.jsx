"use client";

import { motion } from "framer-motion";
import TraceConsole from "./TraceConsole";

const STEPS = [
  {
    n: "01",
    title: "You describe the car you need",
    body: "Budget, body type, must-haves — mileage, seating, boot space. Plain language, no filters to configure.",
  },
  {
    n: "02",
    title: "It checks live listings, not memory",
    body: "Prices and availability change daily. Arclight searches current listings and spec sheets instead of guessing from training data.",
  },
  {
    n: "03",
    title: "Comparisons stream in as they happen",
    body: "Every listing pulled and every spec compared shows up in the trace live, so you see the reasoning, not just a verdict.",
  },
  {
    n: "04",
    title: "You get one grounded recommendation",
    body: "A specific car, priced today, with the trade-offs stated plainly — not a list of ten options to research yourself.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/60 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="font-display text-2xl font-semibold text-ink sm:text-3xl lg:text-4xl"
        >
          Four steps, every single time.
        </motion.h2>

        <div className="mt-10 grid gap-8 sm:mt-14 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-12">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="bg-surface p-5 sm:p-6"
              >
                <span className="font-mono text-sm text-signal">{step.n}</span>
                <h3 className="mt-3 font-display text-base font-semibold text-ink sm:mt-4 sm:text-lg">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <TraceConsole />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
