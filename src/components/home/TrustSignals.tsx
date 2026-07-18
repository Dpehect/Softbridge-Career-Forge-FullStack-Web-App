"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  BarChart3,
  Cpu,
  Eye,
  Languages,
  PenLine,
  ShieldCheck,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

const palette = [
  {
    bg: "from-sky-400 to-blue-500",
    ring: "group-hover:ring-sky-300/50",
    iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300",
  },
  {
    bg: "from-orange-400 to-amber-500",
    ring: "group-hover:ring-orange-300/50",
    iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300",
  },
  {
    bg: "from-emerald-400 to-green-500",
    ring: "group-hover:ring-emerald-300/50",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  {
    bg: "from-violet-400 to-purple-500",
    ring: "group-hover:ring-violet-300/50",
    iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300",
  },
  {
    bg: "from-pink-400 to-rose-500",
    ring: "group-hover:ring-pink-300/50",
    iconBg: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-300",
  },
  {
    bg: "from-cyan-400 to-teal-500",
    ring: "group-hover:ring-cyan-300/50",
    iconBg: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300",
  },
];

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
    <section className="relative py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
            {copy.trustTitle}
          </p>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-[#3b82f6] to-orange-400" />
        </motion.div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView || prefersReduced ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07 } },
          }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {signals.map((signal, index) => {
            const Icon = signal.icon;
            const tone = palette[index % palette.length]!;
            return (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={
                  prefersReduced
                    ? undefined
                    : { y: -8, scale: 1.02, transition: { type: "spring", stiffness: 320 } }
                }
                className={`group glass-card rounded-2xl p-6 ring-0 transition-shadow hover:shadow-xl ${tone.ring} hover:ring-4`}
              >
                <motion.div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${tone.iconBg}`}
                  animate={prefersReduced ? undefined : { y: [0, -4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.8 + index * 0.15,
                    ease: "easeInOut",
                    delay: index * 0.1,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <h3 className="text-sm font-bold tracking-tight text-ink">
                  {signal.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-2">
                  {signal.body}
                </p>
                <div
                  className={`mt-4 h-1 w-12 rounded-full bg-gradient-to-r ${tone.bg} opacity-80 transition-all duration-300 group-hover:w-24`}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
