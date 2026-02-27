"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
}

const directionOffset: Record<string, { x?: number; y?: number }> = {
  up: { y: 1 },
  down: { y: -1 },
  left: { x: 1 },
  right: { x: -1 },
  none: {},
};

export default function FadeIn({
  children,
  className,
  direction = "up",
  distance = 40,
  delay = 0,
  duration = 0.6,
  once = true,
  threshold = 0.15,
}: FadeInProps) {
  const dir = directionOffset[direction];
  const initial: Record<string, number> = { opacity: 0 };
  if ("y" in dir) initial.y = dir.y! * distance;
  if ("x" in dir) initial.x = dir.x! * distance;

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount: threshold }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] as const }}
    >
      {children}
    </motion.div>
  );
}
