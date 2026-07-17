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
    <section className="py-20 bg-[var(--bg-canvas)]">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Reveal variants={itemVariants}>
            <h2 className="text-3xl font-semibold text-[var(--fg-primary)] tracking-tight">
              {copy.privacySectionTitle}
            </h2>
          </Reveal>
          <Reveal variants={itemVariants} delay={0.1}>
            <p className="text-base text-[var(--fg-secondary)] mt-4">
              {copy.privacySectionSub}
            </p>
          </Reveal>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div variants={itemVariants} className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-5 flex flex-col">
            <Cpu className="w-6 h-6 text-[var(--action-primary)] mb-3" />
            <h3 className="text-sm font-semibold text-[var(--fg-primary)] mt-3">
              {copy.privacyLocal}
            </h3>
            <p className="text-xs text-[var(--fg-secondary)] leading-5 mt-1.5">
              {copy.privacyLocalBody}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-5 flex flex-col">
            <CloudUpload className="w-6 h-6 text-[var(--action-primary)] mb-3" />
            <h3 className="text-sm font-semibold text-[var(--fg-primary)] mt-3">
              {copy.privacySync}
            </h3>
            <p className="text-xs text-[var(--fg-secondary)] leading-5 mt-1.5">
              {copy.privacySyncBody}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-5 flex flex-col">
            <FileX2 className="w-6 h-6 text-[var(--action-primary)] mb-3" />
            <h3 className="text-sm font-semibold text-[var(--fg-primary)] mt-3">
              {copy.privacyFile}
            </h3>
            <p className="text-xs text-[var(--fg-secondary)] leading-5 mt-1.5">
              {copy.privacyFileBody}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-5 flex flex-col">
            <Key className="w-6 h-6 text-[var(--action-primary)] mb-3" />
            <h3 className="text-sm font-semibold text-[var(--fg-primary)] mt-3">
              {copy.privacyGoogle}
            </h3>
            <p className="text-xs text-[var(--fg-secondary)] leading-5 mt-1.5">
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
