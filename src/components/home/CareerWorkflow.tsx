'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessages } from '@/i18n/useMessages';
import { useReducedMotionPreference } from '@/motion/useReducedMotionPreference';
import { panelTransition, fadeUp, staggerContainer } from '@/motion/variants';

function StepPanel({ step }: { step: number }) {
  switch (step) {
    case 1:
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] border-dashed">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-surface-subtle)] flex items-center justify-center mb-4 text-[var(--fg-tertiary)]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-sm font-medium text-[var(--fg-primary)]">Drag & Drop Resume</div>
          <div className="text-xs text-[var(--fg-secondary)] mt-1">PDF, DOCX up to 5MB</div>
        </div>
      );
    case 2:
      return (
        <div className="h-full flex flex-col justify-center p-8 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)]">
          <div className="text-sm font-medium text-[var(--fg-primary)] mb-4">ATS Compatibility Score</div>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-xs text-[var(--fg-secondary)] w-16">Keywords</div>
            <div className="flex-1 h-2 bg-[var(--bg-surface-strong)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--status-positive)] w-[85%] rounded-full" />
            </div>
            <div className="text-xs font-semibold text-[var(--status-positive)]">85%</div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-xs text-[var(--fg-secondary)] w-16">Formatting</div>
            <div className="flex-1 h-2 bg-[var(--bg-surface-strong)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--status-caution)] w-[65%] rounded-full" />
            </div>
            <div className="text-xs font-semibold text-[var(--status-caution)]">65%</div>
          </div>
        </div>
      );
    case 3:
      return (
        <div className="h-full flex flex-col justify-center p-8 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)]">
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-[var(--bg-surface-subtle)] rounded border border-[var(--border-default)] opacity-50">
              <div className="text-[10px] font-semibold text-[var(--status-caution)] uppercase mb-1">Before</div>
              <div className="text-xs text-[var(--fg-secondary)] line-through">Helped with sales and increased revenue.</div>
            </div>
            <div className="p-3 bg-[var(--action-primary-ink)] rounded border border-[var(--action-primary)]">
              <div className="text-[10px] font-semibold text-[var(--action-primary)] uppercase mb-1">After</div>
              <div className="text-xs text-[var(--fg-primary)]">Spearheaded outbound sales initiatives, driving a 34% YoY revenue increase via targeted campaigns.</div>
            </div>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="h-full flex flex-col justify-center p-8 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)]">
          <div className="bg-[var(--bg-canvas)] p-4 rounded-lg border border-[var(--border-default)] shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm font-semibold text-[var(--fg-primary)]">Senior Frontend Engineer</div>
                <div className="text-xs text-[var(--fg-secondary)]">TechCorp Inc.</div>
              </div>
              <div className="bg-[var(--status-positive)]/10 text-[var(--status-positive)] text-[10px] px-2 py-1 rounded font-medium">92% Match</div>
            </div>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] px-2 py-1 bg-[var(--bg-surface-subtle)] text-[var(--fg-secondary)] rounded">React</span>
              <span className="text-[10px] px-2 py-1 bg-[var(--bg-surface-subtle)] text-[var(--fg-secondary)] rounded">TypeScript</span>
              <span className="text-[10px] px-2 py-1 bg-[var(--status-caution)]/10 text-[var(--status-caution)] rounded border border-[var(--status-caution)]/20">GraphQL</span>
            </div>
          </div>
        </div>
      );
    case 5:
      return (
        <div className="h-full flex flex-col justify-center p-6 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)]">
          <div className="flex flex-col gap-3">
            <div className="self-start max-w-[85%] bg-[var(--bg-surface-subtle)] p-3 rounded-2xl rounded-tl-sm">
              <div className="text-[10px] text-[var(--fg-tertiary)] mb-1">Interviewer (AI)</div>
              <div className="text-xs text-[var(--fg-primary)]">Tell me about a time you had to optimize a slow application.</div>
            </div>
            <div className="self-end max-w-[85%] bg-[var(--action-primary)] p-3 rounded-2xl rounded-tr-sm">
              <div className="text-[10px] text-[var(--action-primary-ink)]/80 mb-1">You</div>
              <div className="text-xs text-[var(--action-primary-ink)]">In my last role, we noticed the dashboard taking 4s to load. I used Lighthouse...</div>
            </div>
          </div>
        </div>
      );
    case 6:
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] relative">
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-[var(--border-default)] -translate-y-1/2 z-0" />
          <div className="flex justify-between w-full relative z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[var(--action-primary)] ring-4 ring-[var(--bg-surface)]" />
              <div className="text-[10px] font-medium text-[var(--fg-primary)]">Resume</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[var(--action-primary)] ring-4 ring-[var(--bg-surface)]" />
              <div className="text-[10px] font-medium text-[var(--fg-primary)]">Apply</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[var(--bg-surface-strong)] ring-4 ring-[var(--bg-surface)] border-2 border-[var(--action-primary)]" />
              <div className="text-[10px] font-medium text-[var(--fg-primary)]">Interview</div>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function CareerWorkflow() {
  const { page } = useMessages();
  const copy = page.home;
  const prefersReducedMotion = useReducedMotionPreference();
  const [activeStep, setActiveStep] = useState(1);
  
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps = [
    { id: 1, title: copy.workflowStep1Title, body: copy.workflowStep1Body },
    { id: 2, title: copy.workflowStep2Title, body: copy.workflowStep2Body },
    { id: 3, title: copy.workflowStep3Title, body: copy.workflowStep3Body },
    { id: 4, title: copy.workflowStep4Title, body: copy.workflowStep4Body },
    { id: 5, title: copy.workflowStep5Title, body: copy.workflowStep5Body },
    { id: 6, title: copy.workflowStep6Title, body: copy.workflowStep6Body },
  ];

  useEffect(() => {
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = stepRefs.current.findIndex((ref) => ref === entry.target);
            if (stepIndex !== -1) {
              setActiveStep(stepIndex + 1);
            }
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0.1 }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <section className="py-24 bg-[var(--bg-canvas)]">
        <div className="max-w-[80rem] mx-auto px-4 sm:px-8">
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--fg-primary)] text-balance">
              {copy.workflowTitle}
            </h2>
            {/* @ts-ignore - Handle missing workflowSub smoothly */}
            {copy.workflowSub && (
              <p className="mt-4 text-[var(--fg-secondary)] max-w-2xl">{copy.workflowSub}</p>
            )}
          </div>
          <div className="flex flex-col gap-16">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col gap-6">
                <div>
                  <div className="text-sm font-bold text-[var(--action-primary)] mb-2">Step {step.id}</div>
                  <h3 className="text-xl font-semibold text-[var(--fg-primary)]">{step.title}</h3>
                  <p className="text-sm text-[var(--fg-secondary)] leading-relaxed mt-2">{step.body}</p>
                </div>
                <div className="h-64 rounded-xl overflow-hidden border border-[var(--border-default)]">
                  <StepPanel step={step.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-[var(--bg-canvas)] relative">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-8">
        <div className="mb-16 text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--fg-primary)] text-balance">
            {copy.workflowTitle}
          </h2>
          {/* @ts-ignore */}
          {copy.workflowSub && (
            <p className="mt-4 text-[var(--fg-secondary)] max-w-2xl lg:mx-0 mx-auto text-balance">
              {/* @ts-ignore */}
              {copy.workflowSub}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16">
          {/* Left side: Scrollable steps */}
          <div className="relative">
            {/* Vertical Line Indicator (desktop only) */}
            <div className="hidden lg:block absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border-default)]" />

            <div className="flex flex-col gap-24 lg:gap-32 pb-32">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  ref={(el) => { stepRefs.current[idx] = el; }}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="relative pl-0 lg:pl-16 flex flex-col lg:block"
                >
                  {/* Mobile Thumbnail */}
                  <div className="block lg:hidden h-48 w-full mb-6 rounded-xl overflow-hidden border border-[var(--border-default)]">
                    <StepPanel step={step.id} />
                  </div>

                  {/* Desktop Dot Indicator */}
                  <div className="hidden lg:flex absolute left-[15px] -translate-x-1/2 top-1 w-8 h-8 rounded-full bg-[var(--bg-canvas)] border-2 border-[var(--border-default)] items-center justify-center transition-colors duration-300 z-10"
                    style={{
                      borderColor: activeStep >= step.id ? 'var(--action-primary)' : 'var(--border-default)',
                      backgroundColor: activeStep >= step.id ? 'var(--action-primary)' : 'var(--bg-canvas)',
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: activeStep >= step.id ? 'white' : 'var(--fg-tertiary)' }}>
                      {step.id}
                    </span>
                  </div>

                  <div>
                    <div className="lg:hidden text-sm font-bold text-[var(--action-primary)] mb-2">Step {step.id}</div>
                    <h3 className="text-xl font-semibold text-[var(--fg-primary)] transition-colors duration-300"
                      style={{ opacity: activeStep === step.id ? 1 : 0.4 }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-[var(--fg-secondary)] leading-relaxed mt-2 transition-opacity duration-300"
                      style={{ opacity: activeStep === step.id ? 1 : 0.4 }}
                    >
                      {step.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right side: Sticky preview */}
          <div className="hidden lg:block relative">
            <div className="sticky top-[5rem] max-h-[80vh] h-[600px] w-full bg-[var(--bg-surface-subtle)] rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  variants={panelTransition}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full h-full p-4"
                >
                  <div className="w-full h-full bg-[var(--bg-canvas)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
                     <StepPanel step={activeStep} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
