'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCircle2, XCircle, Bookmark } from 'lucide-react'
import { useMessages } from '@/i18n/useMessages'
import { staggerContainer, fadeUp } from '@/motion/variants'

const JOBS = [
  {
    role: 'Senior Frontend Engineer',
    company: 'SoftBridge',
    score: 87,
    matched: ['React', 'Next.js', 'TypeScript', 'Accessibility'],
    missing: ['CI/CD'],
  },
  {
    role: 'Staff Product Engineer',
    company: 'Harbor',
    score: 71,
    matched: ['TypeScript', 'Architecture'],
    missing: ['Leadership', 'Node.js'],
  },
  {
    role: 'Platform Intern',
    company: 'BuildCo',
    score: 94,
    matched: ['React', 'TypeScript', 'Learning'],
    missing: [],
  },
]

export default function JobMatchPreview() {
  const { page } = useMessages()
  const copy = page.home
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="py-24 bg-[var(--bg-surface)]">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-8">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--fg-primary)] text-balance mb-4">
            {copy.jobMatchTitle}
          </h2>
          <p className="text-lg text-[var(--fg-secondary)] max-w-2xl">
            {copy.jobMatchSub}
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {JOBS.map((job, index) => (
            <motion.div
              key={index}
              variants={shouldReduceMotion ? {} : fadeUp}
              className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg p-5 relative group transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg"
            >
              <div className="absolute top-4 right-4">
                <span className="text-xs font-mono px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-[var(--fg-tertiary)]">
                  {copy.jobMatchDemo || 'Demo data'}
                </span>
              </div>
              <div className="mb-6 mt-2">
                <div className={`text-4xl font-mono mb-2 ${job.score >= 80 ? 'text-[var(--action-primary)]' : 'text-[var(--status-caution)]'}`}>
                  {job.score}%
                </div>
                <div className="font-semibold text-lg text-[var(--fg-primary)] mb-1">
                  {job.role}
                </div>
                <div className="text-sm text-[var(--fg-tertiary)]">
                  {job.company}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {job.matched.length > 0 && (
                  <div>
                    <div className="text-xs text-[var(--fg-secondary)] mb-2 font-medium">
                      {copy.jobMatchMatched}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.matched.map((skill, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs bg-[var(--positive-wash)] text-[var(--status-positive)] px-2 py-1 rounded border border-[var(--status-positive)]/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {job.missing.length > 0 && (
                  <div>
                    <div className="text-xs text-[var(--fg-secondary)] mb-2 font-medium">
                      {copy.jobMatchMissing}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.missing.map((skill, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs bg-[var(--caution-wash)] text-[var(--status-caution)] px-2 py-1 rounded border border-[var(--status-caution)]/20">
                          <XCircle className="w-3 h-3" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-4 mt-auto">
                <button className="text-[var(--fg-secondary)] hover:text-[var(--action-primary)] transition-colors p-2 -ml-2 rounded-md hover:bg-[var(--bg-surface-subtle)]" aria-label={copy.jobMatchSave}>
                  <Bookmark className="w-4 h-4" />
                </button>
                <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-[var(--action-primary)] group-hover:underline cursor-pointer">
                  {copy.jobMatchRole}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          variants={shouldReduceMotion ? {} : fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-default)]"
        >
          <div>
            <div className="font-semibold text-[var(--fg-primary)] mb-1">
              {copy.jobMatchWhy}
            </div>
            <div className="text-sm text-[var(--fg-secondary)]">
              {copy.jobMatchWhyBody}
            </div>
          </div>
          <Link href="/jobs" className="flex items-center gap-2 whitespace-nowrap bg-[var(--action-primary)] text-[var(--action-primary-ink)] px-5 py-2.5 rounded-md font-medium hover:bg-[var(--action-primary-hover)] transition-colors">
            {copy.jobMatchCta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
