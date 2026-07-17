'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { useMessages } from '@/i18n/useMessages'
import { fadeUp } from '@/motion/variants'

export default function InterviewCoachPreview() {
  const { page } = useMessages()
  const copy = page.home
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
  const shouldReduceMotion = useReducedMotion()

  const [displayedText, setDisplayedText] = useState('')
  const fullText = copy.interviewUserAns || ''

  useEffect(() => {
    if (!isInView) return
    if (shouldReduceMotion) {
      setDisplayedText(fullText)
      return
    }

    const timer = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        setDisplayedText(fullText.slice(0, i + 1))
        i++
        if (i >= fullText.length) {
          clearInterval(interval)
        }
      }, 20)

      return () => clearInterval(interval)
    }, 1500)

    return () => clearTimeout(timer)
  }, [isInView, shouldReduceMotion, fullText])

  return (
    <section className="py-24 bg-[var(--bg-canvas)]">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            ref={ref}
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--fg-primary)] text-balance mb-4">
              {copy.interviewTitle}
            </h2>
            <p className="text-lg text-[var(--fg-secondary)] mb-8">
              {copy.interviewSub}
            </p>
            <Link href="/coach" className="inline-flex items-center gap-2 bg-[var(--bg-surface)] text-[var(--fg-primary)] border border-[var(--border-strong)] px-5 py-2.5 rounded-md font-medium hover:bg-[var(--bg-surface-subtle)] transition-colors">
              {copy.interviewCta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            variants={shouldReduceMotion ? {} : fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg overflow-hidden shadow-sm"
          >
            <div className="bg-[var(--bg-surface-subtle)] border-b border-[var(--border-default)] px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--fg-primary)]">CareerForge Coach</span>
              <span className="text-xs bg-[var(--accent-wash)] text-[var(--action-primary)] px-2 py-0.5 rounded border border-[var(--action-primary)]/20">
                Resume context active
              </span>
            </div>

            <div className="p-5 space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-medium text-[var(--fg-tertiary)] uppercase tracking-wider">Interviewer</div>
                <div className="bg-[var(--accent-wash)] rounded-lg p-3 text-sm text-[var(--fg-primary)] border border-[var(--action-primary)]/10">
                  {copy.interviewQ}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-[var(--fg-tertiary)] uppercase tracking-wider">Your Answer</div>
                <div className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg p-3 text-sm text-[var(--fg-secondary)] min-h-[4rem]">
                  {displayedText}
                  {displayedText.length < fullText.length && !shouldReduceMotion && (
                    <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[var(--fg-tertiary)] animate-pulse align-middle" />
                  )}
                </div>
              </div>

              {(displayedText.length === fullText.length || shouldReduceMotion) && (
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4 pt-4 border-t border-[var(--border-default)]"
                >
                  <div className="text-xs font-medium text-[var(--fg-tertiary)] uppercase tracking-wider">
                    {copy.interviewFeedbackTitle}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 text-sm bg-[var(--positive-wash)] p-3 rounded-md border border-[var(--status-positive)]/20">
                      <CheckCircle2 className="w-4 h-4 text-[var(--status-positive)] shrink-0 mt-0.5" />
                      <span className="text-[var(--status-positive)]">{copy.interviewStrong}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm bg-[var(--caution-wash)] p-3 rounded-md border border-[var(--status-caution)]/20">
                      <XCircle className="w-4 h-4 text-[var(--status-caution)] shrink-0 mt-0.5" />
                      <span className="text-[var(--status-caution)]">{copy.interviewMissing}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-medium text-[var(--status-positive)] uppercase tracking-wider">Suggested Improvement</div>
                    <div className="bg-[var(--positive-wash)] border border-[var(--status-positive)]/30 rounded-lg p-3 text-sm text-[var(--status-positive)]">
                      {copy.interviewImproved}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
