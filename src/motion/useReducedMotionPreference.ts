"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Returns true if the user prefers reduced motion.
 * Use this to conditionally skip or simplify complex animations.
 */
export function useReducedMotionPreference(): boolean {
  const prefersReduced = useReducedMotion();
  return prefersReduced ?? false;
}
