"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedNumber({
  value,
  duration = 1.2,
  className,
  suffix = "",
  prefix = "",
}: AnimatedNumberProps) {
  const prefersReduced = useReducedMotionPreference();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [displayValue, setDisplayValue] = useState(0);

  const motionValue = useMotionValue(prefersReduced ? value : 0);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    if (prefersReduced) return;
    if (inView) {
      motionValue.set(value);
    }
  }, [inView, value, motionValue, prefersReduced]);

  useEffect(() => {
    if (prefersReduced) return;
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue, prefersReduced]);

  return (
    <span ref={ref} className={cn("font-mono tabular-nums", className)}>
      {prefix}{prefersReduced ? value : displayValue}{suffix}
    </span>
  );
}
