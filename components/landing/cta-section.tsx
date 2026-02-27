"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import FadeIn from "@/components/motion/fade-in";

export default function CTASection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const orbY1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <section ref={ref} className="bg-mw-bg py-16">
      <div className="mx-auto w-full max-w-6xl px-5">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b2f38] via-[#0b4f5a] to-[#0d6b78] px-8 py-16 text-center shadow-2xl">
            {/* Parallax glow orbs */}
            <motion.div
              style={{ y: orbY1 }}
              className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-mw-accent/15 blur-3xl"
            />
            <motion.div
              style={{ y: orbY2 }}
              className="pointer-events-none absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-mw-accent/10 blur-3xl"
            />

            <p className="mw-section-label relative z-10 mb-3 text-mw-accent">
              Start today
            </p>
            <h2 className="relative z-10 mx-auto max-w-[22ch] text-4xl font-black leading-tight tracking-tight text-white lg:text-5xl">
              Build your financial system. Start this week.
            </h2>
            <p className="relative z-10 mt-4 text-base font-light text-white/60">
              Use the app now. Connect your bank and scale as you grow.
            </p>
            <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-mw-accent px-7 text-sm font-bold text-[#051a20] shadow-lg shadow-mw-accent/25 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-white/20"
              >
                <span className="relative z-10">Create free account</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-6 text-sm font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5"
              >
                Sign in
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
