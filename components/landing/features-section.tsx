"use client";

import { motion } from "motion/react";
import FadeIn from "@/components/motion/fade-in";
import StaggerChildren, { staggerItemVariants } from "@/components/motion/stagger-children";

const featureList = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Live Money Clarity",
    description: "Track income and expenses in one place with balance visibility at all times.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Pre-Spend Decision Support",
    description: "Check affordability before purchases and reduce impulse spending.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
      </svg>
    ),
    title: "Simple Financial System",
    description: "Use practical budgeting rules and keep your plan easy to follow.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-mw-bg py-24">
      <div className="mx-auto w-full max-w-6xl px-5">
        <FadeIn>
          <p className="mw-section-label mb-2">Why Metra Wealth</p>
          <h2 className="text-4xl font-black tracking-tight text-mw-primary">
            Everything you need to own your finances.
          </h2>
          <p className="mt-3 max-w-[55ch] text-base font-light leading-relaxed text-mw-body">
            A focused toolkit built around clarity, confidence, and consistency — not complexity.
          </p>
        </FadeIn>

        <StaggerChildren className="mt-12 grid gap-5 sm:grid-cols-3" staggerDelay={0.15}>
          {featureList.map((f) => (
            <motion.article
              key={f.title}
              variants={staggerItemVariants}
              className="group mw-card cursor-default p-7 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-mw-accent/10"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-mw-soft to-mw-bg text-mw-primary transition-all duration-300 group-hover:from-mw-accent/15 group-hover:to-mw-accent/5 group-hover:text-mw-accent group-hover:scale-110">
                {f.icon}
              </div>
              <h3 className="mb-2 text-base font-bold text-mw-primary">{f.title}</h3>
              <p className="text-sm font-light leading-relaxed text-mw-body">{f.description}</p>
            </motion.article>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
