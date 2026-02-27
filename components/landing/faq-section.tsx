"use client";

import { motion } from "motion/react";
import FadeIn from "@/components/motion/fade-in";
import StaggerChildren, { staggerItemVariants } from "@/components/motion/stagger-children";

const faqs = [
  {
    question: "Do I need to connect my bank now?",
    answer: "No. Start with manual tracking immediately — bank connection is optional and can be added later.",
  },
  {
    question: "Can I start free and upgrade later?",
    answer: "Yes. Start with the base workflow and move to premium features anytime.",
  },
  {
    question: "Is this financial advice?",
    answer: "No. Metra Wealth provides planning support and guidance tools only.",
  },
];

export default function FAQSection() {
  return (
    <section className="bg-mw-soft py-24">
      <div className="mx-auto w-full max-w-6xl px-5">
        <FadeIn>
          <p className="mw-section-label mb-2">FAQ</p>
          <h2 className="text-4xl font-black tracking-tight text-mw-primary">
            Common questions, honest answers.
          </h2>
          <p className="mt-3 max-w-[46ch] text-base font-light leading-relaxed text-mw-body">
            Everything you need to know before getting started.
          </p>
        </FadeIn>

        <StaggerChildren className="mt-10 grid gap-4 sm:grid-cols-3" staggerDelay={0.12}>
          {faqs.map((item) => (
            <motion.article
              key={item.question}
              variants={staggerItemVariants}
              className="mw-card cursor-default p-6 hover:-translate-y-1 hover:shadow-md hover:shadow-mw-primary/5"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-mw-soft text-mw-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 className="mb-2 text-sm font-bold text-mw-primary">{item.question}</h3>
              <p className="text-sm font-light leading-relaxed text-mw-body">{item.answer}</p>
            </motion.article>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
