"use client";

import { motion } from "framer-motion";
import CarSilhouette from "./CarSilhouette";

export default function CTA() {
  return (
    <section id="pricing" className="border-t border-border/60 px-4 py-20 sm:px-6 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border bg-surface px-6 py-12 text-center sm:px-8 sm:py-16"
      >
        <div className="pointer-events-none absolute -bottom-12 left-1/2 w-[80%] max-w-[420px] -translate-x-1/2 opacity-[0.12] sm:-bottom-16">
          <CarSilhouette id="cta-car" glow={false} />
        </div>

        <div className="relative">
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl lg:text-4xl">
            Your next car, found honestly.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
            Arclight runs on your own Gemini API key, so there's no seat cost from us —
            you pay Google's usage pricing directly, and you can see exactly what each search costs.
          </p>
          <a
            href="/agent"
            className="mt-8 inline-block w-full rounded-full bg-accent px-7 py-3 text-sm font-semibold text-base transition hover:brightness-110 sm:w-auto"
          >
            Get a recommendation
          </a>
        </div>
      </motion.div>
    </section>
  );
}
