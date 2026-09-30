"use client";

import { motion } from "framer-motion";

// Paste any image address here (right-click an image in your browser ->
// "Copy image address") and it will show up — no next.config.mjs changes
// needed, since we're using a plain <img> tag instead of next/image below.
//
// Trade-off worth knowing: a plain <img> skips Next's automatic image
// optimization (resizing, format conversion, lazy-loading tuning), and a
// URL you don't control can change or go offline under you. Fine for
// getting the site looking right today — swap to real hosted photos
// (your own listing photos, or the static /assets import version from
// earlier) before you rely on this in production.
const TYPES = [
  {
    id: "sedan",
    name: "Sedans",
    body: "For comfortable daily commutes and highway miles.",
    tag: "18–24 kmpl avg",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8D5WW72n7R7aLWEpP2M2reA-JvDdND62wUU8JsOcs3g&s=10",
  },
  {
    id: "suv",
    name: "SUVs",
    body: "Ground clearance and space, without giving up ride quality.",
    tag: "5 & 7-seat options",
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsTaaI6pxmSQ4Be2Qm-Yd8Aa9ojwB0-bYD0apaEHLmcw&s=10",
  },
  {
    id: "electric",
    name: "Electric",
    body: "Real-world range and charging time, checked against current listings.",
    tag: "200–450 km range",
    imageUrl:
      "https://stimg.cardekho.com/images/carexteriorimages/930x620/Hyundai/Creta-Electric/11523/1763990398940/front-view-118.jpg?tr=w-420",
  },
  {
    id: "performance",
    name: "Performance",
    body: "Power figures and 0–100 times, verified against the spec sheet.",
    tag: "Sub-5s options",
    imageUrl:
      "https://stimg.cardekho.com/images/carexteriorimages/630x420/Audi/A4/10548/1757137106350/front-left-side-47.jpg?tr=w-360",
  },
];

export default function CarShowcase() {
  return (
    <section className="border-t border-border/60 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between"
        >
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl lg:text-4xl">
            Every body type, one honest answer.
          </h2>
          <p className="max-w-sm text-sm text-muted">
            Motofind doesn't just know the category — it checks what's actually
            listed and priced right now before it recommends one.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {TYPES.map((type, i) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5"
            >
              {/* shine sweep on hover */}
              <div className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-accent/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

              <div className="relative h w-full overflow-hidden rounded-xl bg-base sm:h-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={type.imageUrl}
                  alt={`${type.name} — ${type.body}`}
                  loading="lazy"
                  decoding="async"
                  // Some hosts block hotlinked images based on the referrer
                  // header — this quietly avoids the most common cause of a
                  // pasted URL showing a broken-image icon.
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <span className="mt-3 inline-block rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-accent">
                {type.tag}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                {type.name}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {type.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
