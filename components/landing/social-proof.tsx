"use client";

import { motion } from "motion/react";
import FadeIn from "@/components/motion/fade-in";
import StaggerChildren, { staggerItemVariants } from "@/components/motion/stagger-children";

const testimonials = [
  {
    quote: "I finally know where my money goes each week. The purchase check feature alone saved me hundreds.",
    name: "Sarah K.",
    role: "Freelance Designer",
    initials: "SK",
    gradient: "from-mw-accent to-teal-400",
  },
  {
    quote: "Simple, clean, and it actually makes me want to track my spending. No other app did that.",
    name: "Marcus T.",
    role: "Software Engineer",
    initials: "MT",
    gradient: "from-mw-light to-mw-primary",
  },
  {
    quote: "The AI advisor helped me realize I was overspending on subscriptions. Saved $120/month.",
    name: "Priya R.",
    role: "Marketing Manager",
    initials: "PR",
    gradient: "from-teal-400 to-mw-accent",
  },
];

export default function SocialProof() {
  return (
    <section className="bg-mw-soft py-24">
      <div className="mx-auto w-full max-w-6xl px-5">
        <FadeIn className="text-center">
          <p className="mw-section-label mb-2">Trusted by users</p>
          <h2 className="text-4xl font-black tracking-tight text-mw-primary">
            People love Metra Wealth.
          </h2>
          <p className="mx-auto mt-3 max-w-[50ch] text-base font-light leading-relaxed text-mw-body">
            See how others are building better financial habits with simple, consistent tracking.
          </p>
        </FadeIn>

        <StaggerChildren className="mt-12 grid gap-5 sm:grid-cols-3" staggerDelay={0.15}>
          {testimonials.map((t) => (
            <motion.article
              key={t.name}
              variants={staggerItemVariants}
              className="mw-card p-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-mw-accent/10"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5 text-mw-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm font-light leading-relaxed text-mw-body italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-xs font-bold text-white`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-mw-primary">{t.name}</p>
                  <p className="text-xs text-mw-body">{t.role}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
