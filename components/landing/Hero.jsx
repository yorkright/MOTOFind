"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import CarSilhouette from "./CarSilhouette";

const SPEC_BADGES = [
  { label: "0–100 km/h", value: "4.2s", top: "8%", left: "4%", delay: 0.5 },
  { label: "Listings compared", value: "12,400+", top: "74%", left: "0%", delay: 0.65 },
  { label: "Avg. savings found", value: "₹48,000", top: "12%", left: "76%", delay: 0.8 },
];

export default function Hero() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-40, 40], [6, -6]), { stiffness: 120, damping: 15 });
  const rotateY = useSpring(useTransform(mouseX, [-60, 60], [-8, 8]), { stiffness: 120, damping: 15 });

  function handleMouseMove(e) {
    // Parallax tilt is a mouse-only flourish — pointer-fine devices get it,
    // touch devices simply never fire mousemove, so no special-casing needed.
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section id="top" className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-40">
      {/* Blueprint grid backdrop — engineering-spec feel, not a generic glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#4C7CF3 1px, transparent 1px), linear-gradient(90deg, #4C7CF3 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[350px] w-[90%] max-w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[100px] sm:h-[500px] sm:blur-[130px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 font-mono text-xs text-signal sm:mb-5 sm:text-sm"
          >
            Live inventory · real specs · zero guesswork
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl sm:leading-[1.05] lg:text-6xl"
          >
            Find the right car,
            <br />
            not just <span className="text-accent">a</span> car.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 max-w-md text-base text-muted sm:mt-6 sm:text-lg"
          >
            Tell Arclight your budget and what matters — mileage, boot space,
            resale, whatever. It checks live listings and real specs before it
            answers, and shows you exactly what it found.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4"
          >
            <a
              href="/chat"
              className="w-full rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-base transition hover:brightness-110 sm:w-auto"
            >
              Get a recommendation
            </a>
            <a
              href="#how-it-works"
              className="w-full rounded-full border border-border px-6 py-3 text-center text-sm font-medium text-ink transition hover:border-muted sm:w-auto"
            >
              See how it decides
            </a>
          </motion.div>
        </div>

        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ perspective: 800 }}
          className="relative mt-4 lg:mt-0"
        >
          <motion.div style={{ rotateX, rotateY }}>
            <CarSilhouette
              id="hero-car"
              className="w-full drop-shadow-[0_20px_28px_rgba(0,0,0,0.4)] sm:drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
            />
          </motion.div>

          {SPEC_BADGES.map((badge) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: badge.delay }}
              style={{ top: badge.top, left: badge.left }}
              className="absolute hidden rounded-xl border border-border bg-surface/90 px-3 py-2 shadow-lg backdrop-blur-sm lg:block"
            >
              <div className="font-mono text-[10px] uppercase tracking-wide text-muted">
                {badge.label}
              </div>
              <div className="font-display text-sm font-semibold text-ink">{badge.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
