"use client";

import Link from "next/link";
import { motion } from "motion/react";

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export default function HeroSection() {
  return (
    <section className="relative bg-mw-bg overflow-hidden">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-mw-accent/8 blur-[100px] animate-float-slow" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-mw-light/10 blur-[80px] animate-float" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-mw-accent/5 blur-[90px] animate-glow-pulse" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
        {/* Left: copy with staggered reveal */}
        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.div variants={heroItem}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-mw-accent/25 bg-mw-accent/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mw-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-mw-light">
                AI Financial Companion
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={heroItem}
            className="text-5xl font-black leading-[1.05] tracking-tight text-mw-primary lg:text-6xl"
          >
            Build a money system you can{" "}
            <span className="bg-gradient-to-r from-mw-light to-mw-accent bg-clip-text text-transparent">
              trust every week.
            </span>
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="mt-6 max-w-[44ch] text-lg font-light leading-relaxed text-mw-body"
          >
            Metra Wealth helps you track spending, protect your balance, and
            make smarter decisions before you buy — all in one place.
          </motion.p>

          <motion.div variants={heroItem} className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-mw-accent to-mw-primary px-7 text-base font-bold text-white shadow-lg shadow-mw-accent/25 transition-all duration-300 hover:shadow-xl hover:shadow-mw-accent/35"
            >
              <span className="relative z-10">Start free</span>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
              <span className="absolute inset-0 bg-gradient-to-r from-mw-primary to-mw-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
            <Link href="/pricing" className="mw-btn-ghost h-12 px-6 text-base">
              See pricing
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={heroItem} className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["bg-mw-accent", "bg-mw-light", "bg-mw-primary", "bg-teal-400"].map((color, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-full ${color} border-2 border-mw-bg ring-1 ring-mw-border/50`}
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-mw-primary">Join 2,000+ users</p>
              <p className="text-xs text-mw-body">Building better money habits</p>
            </div>
          </motion.div>

          <motion.div variants={heroItem} className="mt-5 flex flex-wrap gap-2">
            {["✓ Setup in minutes", "✓ No card required", "✓ Upgrade anytime"].map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-mw-border bg-mw-surface px-3.5 py-1 text-xs font-medium text-mw-body"
              >
                {pill}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: early access card */}
        <motion.div
          variants={cardReveal}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <div className="mw-card relative overflow-hidden p-8 shadow-xl shadow-mw-primary/5">
            {/* Top accent bar */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-mw-light to-mw-accent" />

            {/* Shimmer overlay */}
            <div className="pointer-events-none absolute inset-0 animate-shimmer rounded-2xl" />

            <p className="mw-section-label mb-1">Early access</p>
            <h2 className="text-2xl font-black tracking-tight text-mw-primary">
              Get early access
            </h2>
            <p className="mt-1 text-sm text-mw-body">
              Join the waitlist and receive onboarding updates.
            </p>

            <form action="/register" className="mt-6 grid gap-3">
              <div>
                <label htmlFor="lead-name" className="mw-label mb-1.5 block">
                  Name
                </label>
                <input
                  id="lead-name"
                  type="text"
                  placeholder="Your name"
                  className="mw-input"
                />
              </div>
              <div>
                <label htmlFor="lead-email" className="mw-label mb-1.5 block">
                  Email
                </label>
                <input
                  id="lead-email"
                  type="email"
                  placeholder="you@example.com"
                  className="mw-input"
                />
              </div>
              <button type="submit" className="mw-btn-primary mt-1 h-11 w-full text-base">
                Get started →
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-mw-body">
              No credit card required · Free forever plan available
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
