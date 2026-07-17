"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";
import { fadeUp, reducedFadeUp } from "@/motion/variants";
import type { Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  once?: boolean;
  margin?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export function Reveal({
  children,
  className,
  variants,
  delay = 0,
  once = true,
  margin = "-8% 0px",
  as = "div",
}: RevealProps) {
  const prefersReduced = useReducedMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: margin as `${number}px` });

  const activeVariants = prefersReduced
    ? reducedFadeUp
    : (variants ?? fadeUp);

  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionComponent
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={activeVariants}
      custom={delay}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </MotionComponent>
  );
}
