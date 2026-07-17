'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotionPreference } from '@/motion/useReducedMotionPreference';
import { AnimatedNumber } from '@/motion/AnimatedNumber';
import { panelTransition, fadeIn, scaleIn } from '@/motion/variants';

type TabView = 'ats' | 'match' | 'interview';

const TOTAL_STEPS = 8;
const STEP_DURATION_MS = 1500;

export function AnimatedProductPreview() {
  const prefersReducedMotion = useReducedMotionPreference();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<TabView>('ats');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Jump to end if reduced motion is preferred
  useEffect(() => {
    if (prefersReducedMotion) {
      setCurrentStep(TOTAL_STEPS);
      setIsPlaying(false);
    }
  }, [prefersReducedMotion]);

  // Animation progression
  useEffect(() => {
    if (!isPlaying || currentStep >= TOTAL_STEPS) {
      if (currentStep >= TOTAL_STEPS) setIsPlaying(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }, STEP_DURATION_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStep, isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const replay = () => {
    setCurrentStep(0);
    setIsPlaying(true);
    setActiveTab('ats');
  };

  return (
    <div className="w-full max-w-[560px] aspect-[4/3] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg shadow-lg overflow-hidden flex flex-col relative font-sans">
      {/* Top Bar / Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-default)] bg-[var(--bg-canvas)]">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
            className="text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors px-2 py-1 rounded hover:bg-[var(--bg-surface)]"
            disabled={currentStep >= TOTAL_STEPS && isPlaying}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={replay}
            aria-label="Replay animation"
            className="text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors px-2 py-1 rounded hover:bg-[var(--bg-surface)]"
          >
            Replay
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: CV Preview */}
        <div className="w-1/3 border-r border-[var(--border-default)] bg-[var(--bg-canvas)] relative p-4 flex flex-col overflow-hidden">
          <AnimatePresence>
            {currentStep >= 1 && (
              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="w-full h-full bg-white shadow-sm border border-[var(--border-default)] rounded-sm p-3 relative flex flex-col space-y-2"
              >
                <div className="w-3/4 h-2 bg-gray-200 rounded" />
                <div className="w-1/2 h-2 bg-gray-200 rounded" />
                <div className="mt-4 space-y-1">
                  <div className="w-full h-1.5 bg-gray-100 rounded" />
                  <div className="w-full h-1.5 bg-gray-100 rounded" />
                  <div className="w-5/6 h-1.5 bg-gray-100 rounded" />
                </div>
                {/* Weak phrase highlight */}
                <div className="mt-4 space-y-1">
                  <div className="w-full h-1.5 bg-gray-100 rounded" />
                  <motion.div
                    className="h-1.5 rounded"
                    animate={{
                      backgroundColor:
                        currentStep === 5 ? 'var(--action-primary)' : '#f3f4f6',
                      width: currentStep >= 6 ? '90%' : '75%',
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Scan line */}
                {currentStep === 2 && (
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-[var(--action-primary)] shadow-[0_0_8px_var(--action-primary)]"
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1.5, ease: 'linear' }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {currentStep === 0 && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[var(--border-default)] rounded-md">
              <span className="text-xs text-[var(--fg-secondary)]">Drop CV</span>
            </div>
          )}
        </div>

        {/* Right: Results Panel */}
        <div className="w-2/3 bg-[var(--bg-surface)] flex flex-col relative overflow-hidden">
          {currentStep >= 3 ? (
            <>
              {/* Tabs */}
              <div className="flex border-b border-[var(--border-default)]">
                {(['ats', 'match', 'interview'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                      activeTab === tab
                        ? 'text-[var(--action-primary)] border-b-2 border-[var(--action-primary)]'
                        : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-4 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === 'ats' && (
                    <motion.div
                      key="ats"
                      variants={panelTransition}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex flex-col h-full"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-medium text-[var(--fg-secondary)]">
                          Overall Score
                        </span>
                        <div className="text-3xl font-mono text-[var(--action-primary)]">
                          {currentStep >= 4 ? <AnimatedNumber value={82} /> : 0}
                          <span className="text-sm text-[var(--fg-secondary)]">/100</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <ScoreBar label="Structure" score={16} max={20} show={currentStep >= 3} />
                        <ScoreBar label="Keywords" score={14} max={20} show={currentStep >= 3} />
                        <ScoreBar label="Experience" score={22} max={25} show={currentStep >= 3} />
                        <ScoreBar label="Impact" score={8} max={10} show={currentStep >= 3} />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'match' && currentStep >= 7 && (
                    <motion.div
                      key="match"
                      variants={panelTransition}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex flex-col h-full space-y-3"
                    >
                      <JobCard
                        company="Acme Corp"
                        role="Frontend Engineer"
                        match={92}
                        tags={['React', 'TypeScript']}
                      />
                      <JobCard
                        company="Globex UI"
                        role="Product Designer"
                        match={78}
                        tags={['Figma', 'CSS']}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'interview' && currentStep >= 7 && (
                    <motion.div
                      key="interview"
                      variants={panelTransition}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex flex-col h-full"
                    >
                      <div className="bg-[var(--bg-canvas)] p-3 rounded-md border border-[var(--border-default)] mb-3">
                        <p className="text-xs font-medium text-[var(--fg-primary)]">
                          Q: Tell me about a time you optimized performance.
                        </p>
                      </div>
                      <div className="border-l-2 border-[var(--action-primary)] pl-3">
                        <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
                          "I reduced load time by 40% by implementing code splitting and image
                          lazy-loading."
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] rounded-sm font-medium">
                            STAR Method
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded-sm font-medium">
                            Metrics used
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <span className="text-sm text-[var(--fg-secondary)]">
                {currentStep === 0 && 'Waiting for CV...'}
                {currentStep === 1 && 'Document loaded...'}
                {currentStep === 2 && 'Analyzing content...'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  score,
  max,
  show,
}: {
  label: string;
  score: number;
  max: number;
  show: boolean;
}) {
  const percentage = (score / max) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--fg-primary)]">{label}</span>
        <span className="text-[var(--fg-secondary)]">
          {score}/{max}
        </span>
      </div>
      <div className="w-full h-1.5 bg-[var(--bg-canvas)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[var(--action-primary)] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: show ? `${percentage}%` : 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function JobCard({
  company,
  role,
  match,
  tags,
}: {
  company: string;
  role: string;
  match: number;
  tags: string[];
}) {
  return (
    <div className="p-3 border border-[var(--border-default)] rounded-md bg-[var(--bg-canvas)]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-sm font-medium text-[var(--fg-primary)]">{role}</h4>
          <p className="text-xs text-[var(--fg-secondary)]">{company}</p>
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)]">
          <span className="text-xs font-mono font-medium text-[var(--action-primary)]">
            {match}%
          </span>
        </div>
      </div>
      <div className="flex gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 text-[10px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-[var(--fg-secondary)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
