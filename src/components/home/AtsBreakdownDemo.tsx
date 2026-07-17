'use client';

import React, { useMemo, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useMessages } from '@/i18n/useMessages';
import { calculateAtsScore } from '@/features/analysis/atsScore';
import { AnimatedNumber } from '@/motion/AnimatedNumber';
import { Reveal } from '@/motion/Reveal';
import { getAtsStatusLabel } from '@/features/analysis/atsScore';

type DemoCV = Parameters<typeof calculateAtsScore>[0];

export function AtsBreakdownDemo() {
  const { locale, messages, page } = useMessages();
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  const demoCv = useMemo<DemoCV>(() => ({
    name: 'Yusuf Demir',
    title: 'Senior Frontend Engineer',
    email: 'yusuf@example.com',
    phone: '+90 555 000 00 00',
    location: 'Istanbul',
    summary: 'Frontend engineer focused on accessible, scalable product interfaces with React, Next.js, and TypeScript.',
    experience: [{
      company: 'SoftBridge',
      position: 'Senior Frontend Developer',
      duration: '2022-2026',
      description: [
        'Built a Next.js analytics workspace serving 12,000 active users.',
        'Reduced verified startup time by 35% through code splitting and image optimization.'
      ]
    }],
    skills: ['React', 'Next.js', 'TypeScript', 'CSS', 'Accessibility', 'Testing'],
    education: [{
      school: 'Istanbul Technical University',
      degree: 'Computer Engineering',
      year: '2021'
    }],
    rawLength: 1250
  } as DemoCV), []);

  const scoreResult = useMemo(() => calculateAtsScore(demoCv, locale), [demoCv, locale]);

  return (
    <section className="py-24 bg-[var(--bg-surface)]">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-8">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-semibold text-ink">
                {page.home.atsDemoTitle}
              </h2>
              <p className="text-lg text-ink-2 leading-relaxed">
                {page.home.atsDemoSub}
              </p>
              <p className="text-base text-ink-3">
                {page.home.atsDemoExplain}
              </p>
              
              <div className="mt-8 p-4 bg-surface-2 border border-line rounded-lg text-sm text-ink-2">
                <p>{page.home.atsDemoNote}</p>
              </div>
            </div>

            {/* Right Column */}
            <div 
              ref={ref}
              className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-2xl p-8 shadow-sm"
            >
              <div className="flex flex-col items-center mb-10 text-center">
                <div className="flex items-baseline gap-2">
                  <div className="font-mono text-5xl font-bold text-[var(--action-primary)]">
                    <AnimatedNumber
                      value={scoreResult.total}
                      duration={1.5}
                    />
                  </div>
                  <span className="text-xl text-ink-3 font-medium">/100</span>
                </div>
                <div className="mt-2 text-sm font-medium text-[var(--status-positive)]">
                  {getAtsStatusLabel(scoreResult.status, locale)}
                </div>
              </div>

              <div className="space-y-6">
                {scoreResult.categories.map((cat) => {
                  const percent = Math.min(100, Math.max(0, (cat.score / cat.maxScore) * 100));
                  const label = messages.ats[cat.id as keyof typeof messages.ats] || cat.id;

                  return (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-ink">{String(label)}</span>
                        <span className="text-ink-2 font-mono">
                          {cat.score} / {cat.maxScore}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--bg-surface-subtle)] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-[var(--action-primary)] origin-left"
                          initial={{ scaleX: prefersReducedMotion ? 1 : 0 }}
                          animate={{ scaleX: (isInView || prefersReducedMotion) ? percent / 100 : 0 }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-default)]">
                <div className="inline-block bg-[var(--bg-surface-subtle)] px-3 py-2 rounded-md text-sm text-[var(--action-primary)]">
                  {page.home.atsDemoCategoryNote}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
