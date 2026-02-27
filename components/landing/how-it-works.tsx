"use client";

import { motion } from "motion/react";
import FadeIn from "@/components/motion/fade-in";
import StaggerChildren, { staggerItemVariants } from "@/components/motion/stagger-children";
import Counter from "@/components/motion/counter";

const steps = [
  { num: "01", title: "Connect your routine", detail: "Log transactions daily in under a minute." },
  { num: "02", title: "See your true position", detail: "Get instant totals for income, expenses, and balance." },
  { num: "03", title: "Decide with confidence", detail: "Use advisor prompts before major purchases." },
];

const BAR_HEIGHTS = [40, 65, 50, 80, 55, 90, 70];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-mw-soft py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
        {/* Steps */}
        <div>
          <FadeIn>
            <p className="mw-section-label mb-2">How it works</p>
            <h2 className="text-4xl font-black tracking-tight text-mw-primary">
              Three steps to financial clarity.
            </h2>
            <p className="mt-3 max-w-[46ch] text-base font-light leading-relaxed text-mw-body">
              No complex setup. Just a straightforward system that works from day one.
            </p>
          </FadeIn>

          <StaggerChildren className="mt-10 flex flex-col gap-4" staggerDelay={0.15}>
            {steps.map((step) => (
              <motion.div
                key={step.title}
                variants={staggerItemVariants}
                className="mw-card flex cursor-default gap-5 p-5 hover:shadow-md hover:shadow-mw-primary/5"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mw-light to-mw-accent text-sm font-black text-white">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-bold text-mw-primary">{step.title}</h3>
                  <p className="mt-0.5 text-sm font-light text-mw-body">{step.detail}</p>
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>

        {/* Visual dashboard card */}
        <FadeIn direction="right" distance={60} delay={0.2}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b2f38] to-[#051a20] p-8 shadow-2xl">
            {/* Glow orb */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-mw-accent/15 blur-3xl animate-glow-pulse" />

            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Live Balance
            </p>

            <div className="my-8 text-center">
              <p className="mb-1 text-xs text-white/50">Available funds</p>
              <Counter
                to={4280}
                prefix="$"
                className="text-6xl font-black tracking-tight text-white"
              />
              <motion.p
                className="mt-2 text-sm font-semibold text-mw-accent"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.6, duration: 0.5 }}
              >
                ↑ $340 this week
              </motion.p>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                Weekly activity
              </p>
              <div className="flex h-16 items-end gap-1.5">
                {BAR_HEIGHTS.map((h, i) => (
                  <motion.div
                    key={i}
                    className={`flex-1 rounded-t-sm ${
                      i === 5
                        ? "bg-gradient-to-t from-mw-light to-mw-accent"
                        : "bg-white/10"
                    }`}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: 0.3 + i * 0.08,
                      ease: [0.25, 0.1, 0.25, 1] as const,
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-white/30">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span className="text-mw-accent">Sat</span><span>Sun</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
