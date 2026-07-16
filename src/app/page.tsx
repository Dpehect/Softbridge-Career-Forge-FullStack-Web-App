"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileUp,
  Sparkles,
  Target,
  FileText,
  Briefcase,
  ShieldCheck,
  Mic2,
  Code2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const GITHUB =
  "https://github.com/Dpehect/Softbridge-Career-Forge-FullStack-Web-App/tree/main";

const features = [
  {
    icon: FileUp,
    title: "CV upload & parse",
    body: "PDF or TXT — clean extraction, structured fields, no garbage text.",
    href: "/forge",
  },
  {
    icon: Sparkles,
    title: "Deep professional feedback",
    body: "Strengths, gaps, ATS score, and concrete rewrites you can apply today.",
    href: "/resume",
  },
  {
    icon: Target,
    title: "Job match & ideas",
    body: "Compare to a job ad or get role recommendations from your profile.",
    href: "/forge",
  },
  {
    icon: FileText,
    title: "PDF export",
    body: "Download a clean, professional CV PDF — including photo if you add one.",
    href: "/resume",
  },
  {
    icon: ShieldCheck,
    title: "ATS checks",
    body: "See what automated systems struggle with and how to fix structure fast.",
    href: "/forge",
  },
  {
    icon: Mic2,
    title: "Interview prep",
    body: "Role-aware practice questions with example answers and tips.",
    href: "/forge",
  },
];

export default function HomePage() {
  return (
    <div className="pb-20">
      <section className="relative overflow-hidden px-4 md:px-8 pt-12 md:pt-20 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 right-[-8%] w-[520px] h-[520px] rounded-full bg-cosmic-teal/10 blur-3xl" />
          <div className="absolute top-40 left-[-12%] w-[380px] h-[380px] rounded-full bg-sunset-coral/8 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <Badge variant="accent" className="mb-5">
              SoftBridge Solutions · CareerForge
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl md:text-[3.5rem] font-semibold tracking-tight text-balance leading-[1.05]">
              A professional career workspace for people who want{" "}
              <span className="text-cosmic-teal">clarity and results</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-steel max-w-2xl leading-relaxed">
              Hi — I&apos;m Forge from SoftBridge CareerForge (SoftBridge Solutions). Upload or build
              your CV, get serious feedback, match jobs, export a polished PDF, and prepare for
              interviews — all private in your browser.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/forge"
                className="inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-semibold bg-cosmic-teal text-midnight-void shadow-[0_14px_36px_rgba(217,72,32,0.28)] hover:bg-sunset-coral transition-colors"
              >
                Start with Forge <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/resume"
                className="inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-semibold border border-black/10 bg-panel-elevated hover:border-cosmic-teal/30 transition-colors"
              >
                Open Resume workspace
              </Link>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-sm font-semibold text-muted-steel hover:text-cosmic-teal transition-colors"
              >
                <Code2 className="w-4 h-4" /> View Source on GitHub
              </a>
            </div>
          </motion.div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
              >
                <Link
                  href={f.href}
                  className="block h-full glass-panel rounded-2xl p-5 hover:border-cosmic-teal/25 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cosmic-teal/10 text-cosmic-teal flex items-center justify-center mb-3">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h2 className="font-semibold group-hover:text-cosmic-teal transition-colors">
                    {f.title}
                  </h2>
                  <p className="text-sm text-muted-steel mt-1.5 leading-relaxed">{f.body}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cosmic-teal mb-2">
                How it works
              </p>
              <h2 className="font-display text-2xl font-semibold">Three steps to a stronger CV</h2>
              <ol className="mt-4 space-y-2 text-sm text-muted-steel">
                <li>
                  <span className="font-semibold text-star-white">1.</span> Upload PDF/TXT, paste
                  text, or build from scratch
                </li>
                <li>
                  <span className="font-semibold text-star-white">2.</span> Review structured data +
                  professional feedback
                </li>
                <li>
                  <span className="font-semibold text-star-white">3.</span> Export PDF, match jobs, or
                  practice interviews
                </li>
              </ol>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold bg-star-white text-midnight-void"
              >
                <Briefcase className="w-4 h-4" /> Open dashboard
              </Link>
              <Link
                href="/forge"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold border border-black/10"
              >
                Go to Forge
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
