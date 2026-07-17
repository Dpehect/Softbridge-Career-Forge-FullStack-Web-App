'use client';

import React, { useState } from 'react';
import { useMessages } from '@/i18n/useMessages';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { panelTransition } from '@/motion/variants';

export function EvidenceTransformation() {
  const { page } = useMessages();
  const [isAfter, setIsAfter] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const toggleState = () => setIsAfter((prev) => !prev);

  const beforeContent = (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-6 h-full flex flex-col justify-center">
      <div className="mb-4 text-sm font-medium text-caution uppercase tracking-wider">
        {page.home.evidenceWeak}
      </div>
      <p className="text-base leading-relaxed text-[var(--fg-primary)]">
        <span className="bg-[#fef3c7] dark:bg-[#78350f]/30 text-[#92400e] dark:text-[#fde68a] px-1 rounded">Worked on</span> a project for analytics and <span className="bg-[#fef3c7] dark:bg-[#78350f]/30 text-[#92400e] dark:text-[#fde68a] px-1 rounded">built interfaces</span>.
      </p>
    </div>
  );

  const afterContent = (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-6 h-full flex flex-col justify-center">
      <div className="mb-4 text-sm font-medium text-positive uppercase tracking-wider">
        {page.home.evidenceStrong}
      </div>
      <p className="text-base leading-relaxed text-[var(--fg-primary)]">
        <span className="text-[var(--action-primary)] font-medium" title={page.home.evidenceAction}>Built</span>{' '}
        <span className="border-b border-dashed border-[var(--border-default)]" title={page.home.evidenceMethod}>
          a shared component library with React and TypeScript
        </span>,{' '}
        <span className="text-[var(--status-positive)] font-medium" title={page.home.evidenceResult}>
          reducing delivery time by a verified 25%
        </span>.
      </p>
    </div>
  );

  return (
    <section className="py-24 bg-[var(--bg-canvas)] border-y border-[var(--border-default)]">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--fg-primary)]">
              {page.home.evidenceTitle}
            </h2>
            <p className="text-lg text-[var(--fg-secondary)] leading-relaxed">
              {page.home.evidenceSub}
            </p>
            
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={() => setIsAfter(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  !isAfter 
                    ? 'bg-[var(--action-primary)] text-[var(--action-primary-ink)]'
                    : 'bg-surface-2 text-ink-2 hover:bg-surface'
                }`}
              >
                {page.home.evidenceBefore}
              </button>
              <ArrowRight className="w-4 h-4 text-ink-3" />
              <button
                onClick={() => setIsAfter(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isAfter 
                    ? 'bg-[var(--action-primary)] text-[var(--action-primary-ink)]'
                    : 'bg-surface-2 text-ink-2 hover:bg-surface'
                }`}
              >
                {page.home.evidenceAfter}
              </button>
            </div>

            <p className="text-sm text-ink-3 mt-8">
              {page.home.evidenceDisclaimer}
            </p>

            <div className="pt-4">
              <Link href="/resume" className="inline-flex items-center gap-2 text-[var(--action-primary)] font-medium hover:underline">
                {page.home.evidenceSeeMore} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative min-h-[16rem] w-full">
            {prefersReducedMotion ? (
              <div className="grid grid-cols-1 gap-6">
                {beforeContent}
                {afterContent}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={isAfter ? 'after' : 'before'}
                  variants={panelTransition}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                >
                  {isAfter ? afterContent : beforeContent}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
