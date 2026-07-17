"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart3, Cpu, ShieldCheck, Languages, PenLine, Eye } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";
import { staggerContainer, fadeUp } from "@/motion/variants";

export function TrustSignals() {
  const { page } = useMessages();
  const copy = page.home;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReduced = useReducedMotionPreference();

  const signals = [
    { icon: BarChart3, title: copy.trustAts, body: copy.trustAtsBody },
    { icon: Cpu, title: copy.trustLocal, body: copy.trustLocalBody },
    { icon: ShieldCheck, title: copy.trustSync, body: copy.trustSyncBody },
    { icon: Languages, title: copy.trustBilingual, body: copy.trustBilingualBody },
    { icon: PenLine, title: copy.trustEditable, body: copy.trustEditableBody },
    { icon: Eye, title: copy.trustTransparent, body: copy.trustTransparentBody },
  ] as const;

  return (
    <section className="bg-[var(--bg-surface)] border-y border-[var(--border-default)] py-14 home-section">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-8">
        <p className="section-label text-center mb-8">{copy.trustTitle}</p>

        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView || prefersReduced ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {signals.map((signal, index) => {
            const Icon = signal.icon;
            return (
              <motion.div
                key={index}
                variants={fadeUp}
                className="bg-[var(--bg-canvas)] rounded-lg border border-[var(--border-default)] p-5 transition-shadow hover:shadow-[var(--elevation-1)]"
              >
                <Icon size={18} className="text-[var(--action-primary)]" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-[var(--fg-primary)] mt-3">
                  {signal.title}
                </h3>
                <p className="text-xs text-[var(--fg-secondary)] leading-5 mt-1.5">
                  {signal.body}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
