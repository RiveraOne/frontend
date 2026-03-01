"use client";

import Link from "next/link";
import { motion } from "motion/react";
import FadeIn from "@/components/motion/fade-in";
import StaggerChildren, { staggerItemVariants } from "@/components/motion/stagger-children";

export default function PricingPreview() {
  return (
    <section id="pricing" className="bg-mw-bg py-24">
      <div className="mx-auto w-full max-w-6xl px-5">
        <FadeIn>
          <p className="mw-section-label mb-2">Pricing</p>
          <h2 className="text-4xl font-black tracking-tight text-mw-primary">
            Simple plans for every stage.
          </h2>
          <p className="mt-3 max-w-[50ch] text-base font-light leading-relaxed text-mw-body">
            Two simple plans, cancel anytime. No hidden fees, no long-term lock-in.
          </p>
        </FadeIn>

        <StaggerChildren className="mt-12 grid gap-5 sm:grid-cols-2" staggerDelay={0.18}>
          {/* Essential */}
          <motion.article
            variants={staggerItemVariants}
            className="mw-card p-7 hover:-translate-y-1 hover:shadow-lg hover:shadow-mw-accent/10"
          >
            <p className="mw-section-label mb-4">Essential plan</p>
            <div className="flex items-end gap-1">
              <span className="text-5xl font-black tracking-tight text-mw-primary">$4.99</span>
              <span className="mb-1.5 text-sm text-mw-body">/ month</span>
            </div>
            <p className="mt-4 text-sm font-light leading-relaxed text-mw-body">
              Core tracking, dashboard view, and basic advisor access. Perfect for getting started.
            </p>
            <Link href="/register" className="mw-btn-ghost mt-6 w-full">
              Get Essential →
            </Link>
          </motion.article>

          {/* Pro */}
          <motion.article
            variants={staggerItemVariants}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b2f38] to-[#051a20] p-7 shadow-xl shadow-mw-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-mw-accent/20"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-mw-accent/20 blur-2xl animate-glow-pulse" />
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-mw-accent/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-mw-accent">
              ★ Most popular
            </span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Pro plan</p>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-5xl font-black tracking-tight text-white">$9.99</span>
              <span className="mb-1.5 text-sm text-white/50">/ month</span>
            </div>
            <p className="mt-4 text-sm font-light leading-relaxed text-white/65">
              Advanced insights, unlimited checks, and priority AI responses. The full picture for serious financial clarity.
            </p>
            <Link
              href="/pricing"
              className="group mt-6 relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-mw-accent font-bold text-sm text-[#051a20] transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-mw-accent/30"
            >
              <span className="relative z-10">Get Pro</span>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </motion.article>
        </StaggerChildren>

        <FadeIn delay={0.4}>
          <div className="mt-5 text-center">
            <Link href="/pricing" className="text-sm font-semibold text-mw-primary hover:underline">
              Compare all features →
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
