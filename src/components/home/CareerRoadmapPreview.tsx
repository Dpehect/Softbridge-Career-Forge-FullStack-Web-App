'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, MapPin, Target, CheckCircle2, Clock, Lock } from 'lucide-react';
import { useMessages } from '@/i18n/useMessages';
import { Reveal } from '@/motion/Reveal';
import { useReducedMotionPreference } from '@/motion/useReducedMotionPreference';
import { fadeUp } from '@/motion/variants';

export function CareerRoadmapPreview() {
  const { page } = useMessages();
  const copy = page.home;
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotionPreference();

  const drawVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 as const }, visible: { opacity: 1 as const } }
    : {
        hidden: { opacity: 0 as const },
        visible: { opacity: 1 as const, transition: { duration: 1.5 } },
      };

  return (
    <section className="py-24 bg-[var(--bg-surface)] border-y border-[var(--border-default)]">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <div className="flex flex-col gap-6">
            <Reveal variants={fadeUp}>
              <h2 className="text-3xl md:text-4xl font-semibold text-[var(--fg-primary)] tracking-tight">
                {copy.roadmapTitle}
              </h2>
            </Reveal>
            <Reveal variants={fadeUp} delay={0.1}>
              <p className="text-lg text-[var(--fg-secondary)] leading-relaxed">
                {copy.roadmapSub}
              </p>
            </Reveal>
            <Reveal variants={fadeUp} delay={0.2}>
              <p className="text-base text-[var(--fg-tertiary)]">
                {copy.roadmapGap}
              </p>
            </Reveal>
            <Reveal variants={fadeUp} delay={0.3}>
              <Link 
                href="/paths" 
                className="inline-flex items-center gap-2 text-[var(--action-primary)] font-semibold mt-4 hover:opacity-80 transition-opacity"
              >
                {copy.roadmapCta}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Reveal>
          </div>

          <div 
            ref={containerRef}
            className="bg-[var(--bg-canvas)] rounded-lg border border-[var(--border-default)] p-6 md:p-8 overflow-hidden relative shadow-sm"
          >
            <div className="flex flex-col relative h-[400px]">
              
              {/* SVG Background Path for Desktop */}
              <div className="absolute inset-0 hidden sm:block pointer-events-none" aria-hidden="true">
                <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                  <motion.path
                    d="M 200 40 L 200 120 C 200 150 100 150 100 180 L 100 200 M 200 120 L 200 200 M 200 120 C 200 150 300 150 300 180 L 300 200 M 100 240 C 100 270 200 270 200 300 L 200 360 M 200 240 L 200 360 M 300 240 C 300 270 200 270 200 300 L 200 360"
                    fill="transparent"
                    stroke="var(--border-default)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={drawVariants}
                  />
                </svg>
              </div>

              {/* Current Role Node */}
              <motion.div 
                className="relative z-10 flex flex-col items-center mt-2"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-8 h-8 rounded-full bg-[var(--action-primary)] flex items-center justify-center text-[var(--bg-canvas)] shadow-md">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="mt-3 bg-[var(--bg-surface)] border border-[var(--border-default)] px-3 py-1.5 rounded-full text-xs font-medium text-[var(--fg-primary)] shadow-sm">
                  {copy.roadmapCurrent}
                </div>
              </motion.div>

              {/* Gap Nodes */}
              <div className="relative z-10 flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 mt-16 sm:mt-24 flex-1">
                <motion.div 
                  className="flex flex-col items-center gap-2"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--status-caution)] bg-[var(--bg-canvas)] flex items-center justify-center text-[var(--status-caution)]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-[var(--fg-secondary)] font-medium text-center max-w-[100px]">
                    {copy.roadmapStep1}
                  </span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center gap-2"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--status-caution)] bg-[var(--bg-canvas)] flex items-center justify-center text-[var(--status-caution)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-[var(--fg-secondary)] font-medium text-center max-w-[100px]">
                    {copy.roadmapStep2}
                  </span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center gap-2"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 1.0 }}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--status-caution)] bg-[var(--bg-canvas)] flex items-center justify-center text-[var(--status-caution)]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-[var(--fg-secondary)] font-medium text-center max-w-[100px]">
                    {copy.roadmapStep3}
                  </span>
                </motion.div>
              </div>

              {/* Target Role Node */}
              <motion.div 
                className="relative z-10 flex flex-col items-center mt-12 sm:mt-auto mb-2"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                <div className="w-8 h-8 rounded-full bg-[var(--status-positive)] flex items-center justify-center text-[var(--bg-canvas)] shadow-md">
                  <Target className="w-4 h-4" />
                </div>
                <div className="mt-3 bg-[var(--bg-surface)] border border-[var(--border-default)] px-3 py-1.5 rounded-full text-xs font-medium text-[var(--fg-primary)] shadow-sm">
                  {copy.roadmapTarget}
                </div>
                <div className="mt-4 w-full max-w-[200px] flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] text-[var(--fg-tertiary)] uppercase tracking-wider font-semibold">
                    <span>{copy.roadmapReady}</span>
                    <span className="text-[var(--status-positive)]">68%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-surface-subtle)] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[var(--status-positive)] rounded-full"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: '68%' } : {}}
                      transition={{ duration: 1, delay: 1.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
