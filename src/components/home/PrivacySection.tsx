'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Cpu, CloudUpload, FileX2, Key, ArrowRight } from 'lucide-react';
import { useMessages } from '@/i18n/useMessages';
import { useReducedMotionPreference } from '@/motion/useReducedMotionPreference';
import { staggerContainer, fadeUp } from '@/motion/variants';
import { Reveal } from '@/motion/Reveal';

export function PrivacySection() {
  const { page } = useMessages();
  const copy = page.home;
  const prefersReducedMotion = useReducedMotionPreference();

  const containerVariants = prefersReducedMotion ? {} : staggerContainer;
  const itemVariants = prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeUp;

  return (
    <section className="bg-[var(--bg-canvas)] py-24">
      <div className="mx-auto max-w-[80rem] px-4 sm:px-8">
        
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Reveal variants={itemVariants}>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--fg-primary)] sm:text-4xl">
              {copy.privacySectionTitle}
            </h2>
          </Reveal>
          <Reveal variants={itemVariants} delay={0.1}>
            <p className="mt-5 text-base leading-relaxed text-[var(--fg-secondary)]">
              {copy.privacySectionSub}
            </p>
          </Reveal>
        </div>

        <motion.div 
          className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div variants={itemVariants} className="premium-card flex flex-col p-6">
            <Cpu className="mb-3 h-6 w-6 text-[var(--action-primary)]" />
            <h3 className="mt-2 text-sm font-bold text-[var(--fg-primary)]">
              {copy.privacyLocal}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fg-secondary)]">
              {copy.privacyLocalBody}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="premium-card flex flex-col p-6">
            <CloudUpload className="mb-3 h-6 w-6 text-[var(--action-primary)]" />
            <h3 className="mt-2 text-sm font-bold text-[var(--fg-primary)]">
              {copy.privacySync}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fg-secondary)]">
              {copy.privacySyncBody}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="premium-card flex flex-col p-6">
            <FileX2 className="mb-3 h-6 w-6 text-[var(--action-primary)]" />
            <h3 className="mt-2 text-sm font-bold text-[var(--fg-primary)]">
              {copy.privacyFile}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fg-secondary)]">
              {copy.privacyFileBody}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="premium-card flex flex-col p-6">
            <Key className="mb-3 h-6 w-6 text-[var(--action-primary)]" />
            <h3 className="mt-2 text-sm font-bold text-[var(--fg-primary)]">
              {copy.privacyGoogle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fg-secondary)]">
              {copy.privacyGoogleBody}
            </p>
          </motion.div>
        </motion.div>

        <Reveal variants={itemVariants} delay={0.2}>
          <div className="mt-10 flex justify-center">
            <Link 
              href="/privacy" 
              className="inline-flex items-center gap-1.5 text-sm text-[var(--action-primary)] font-medium hover:opacity-80 transition-opacity"
            >
              {copy.privacyLink}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
