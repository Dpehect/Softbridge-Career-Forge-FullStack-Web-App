"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Target,
  FileText,
  MessageSquareText,
  Briefcase,
  Route,
} from "lucide-react";
import { jobs } from "@/data/jobs";
import { careerPaths } from "@/data/paths";
import { JobCard } from "@/components/JobCard";
import { PathCard } from "@/components/PathCard";
import { Badge } from "@/components/ui/badge";
import { StatPill } from "@/components/StatPill";

const features = [
  {
    icon: Briefcase,
    title: "Curated roles",
    body: "High-signal openings from Softbridge and partner companies — not a spam feed.",
  },
  {
    icon: Route,
    title: "Skill paths",
    body: "Structured tracks that connect learning to outcomes employers actually hire for.",
  },
  {
    icon: FileText,
    title: "Resume forge",
    body: "Craft a calm, metrics-led resume and preview it as you edit.",
  },
  {
    icon: MessageSquareText,
    title: "Career coach",
    body: "Practical prompts for search, interviews, negotiation, and pivots.",
  },
];

export default function HomePage() {
  const featuredJobs = jobs.filter((j) => j.featured).slice(0, 3);

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 md:px-8 pt-10 md:pt-16 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-[-10%] w-[480px] h-[480px] rounded-full bg-cosmic-teal/10 blur-3xl" />
          <div className="absolute bottom-0 left-[-10%] w-[360px] h-[360px] rounded-full bg-sunset-coral/10 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="accent" className="mb-5">
                Softbridge Solutions · Career product
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
                Forge the career you can actually{" "}
                <span className="text-cosmic-teal">stand behind</span>
              </h1>
              <p className="mt-5 text-base md:text-lg text-muted-steel max-w-xl leading-relaxed">
                CareerForge combines curated jobs, skill paths, resume tools, and coaching into one
                warm, premium workspace — so your next move feels intentional, not frantic.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/forge"
                  className="inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-base font-semibold bg-star-white text-midnight-void shadow-[0_8px_24px_rgba(92,46,31,0.12)] hover:bg-cosmic-teal transition-colors"
                >
                  Open Forge AI <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-base font-semibold border border-black/10 hover:border-cosmic-teal/40 hover:text-cosmic-teal transition-colors"
                >
                  Browse roles
                </Link>
              </div>
            </motion.div>

            <div className="mt-10 flex flex-wrap gap-3">
              <StatPill label="Open roles" value={jobs.length} />
              <StatPill label="Career paths" value={careerPaths.length} />
              <StatPill label="Partner cos." value="6+" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.55 }}
            className="glass-panel rounded-3xl p-6 md:p-7 relative"
          >
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-cosmic-teal" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel">
                This week’s forge plan
              </p>
            </div>
            <ul className="space-y-4">
              {[
                { step: "01", title: "Target 3 high-fit roles", meta: "Jobs · 45 min" },
                { step: "02", title: "Finish path module", meta: "Frontend Craft · 2 hrs" },
                { step: "03", title: "Rewrite 2 resume bullets", meta: "Resume forge · 20 min" },
                { step: "04", title: "Mock behavioral with coach", meta: "Coach · 15 min" },
              ].map((item) => (
                <li
                  key={item.step}
                  className="flex gap-3 items-start rounded-2xl bg-abyss-panel/60 border border-black/5 p-3.5"
                >
                  <span className="font-mono text-xs text-cosmic-teal mt-0.5">{item.step}</span>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-steel mt-0.5">{item.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cosmic-teal hover:gap-2.5 transition-all"
            >
              Open dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-2xl p-5"
            >
              <div className="w-9 h-9 rounded-xl bg-cosmic-teal/10 text-cosmic-teal flex items-center justify-center mb-3">
                <f.icon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-steel leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured jobs */}
      <section className="px-4 md:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cosmic-teal mb-2">
                Featured openings
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold">Roles worth your focus</h2>
            </div>
            <Link
              href="/jobs"
              className="text-sm font-semibold text-cosmic-teal inline-flex items-center gap-1 shrink-0"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {featuredJobs.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Paths preview */}
      <section className="px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cosmic-teal mb-2">
                Skill paths
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold flex items-center gap-2">
                <Target className="w-7 h-7 text-cosmic-teal" />
                Build toward a specific outcome
              </h2>
            </div>
            <Link
              href="/paths"
              className="text-sm font-semibold text-cosmic-teal inline-flex items-center gap-1 shrink-0"
            >
              All paths <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerPaths.slice(0, 3).map((path, i) => (
              <PathCard key={path.id} path={path} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 pt-8">
        <div className="max-w-6xl mx-auto glass-panel rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cosmic-teal/10 via-transparent to-sunset-coral/10 pointer-events-none" />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-balance">
              Ready to forge your next chapter?
            </h2>
            <p className="mt-3 text-muted-steel max-w-lg mx-auto">
              Start with a role search or enroll in a path. Your progress saves locally so you can
              pick up where you left off.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/coach"
                className="inline-flex h-11 items-center rounded-xl px-5 font-semibold bg-cosmic-teal text-midnight-void hover:bg-sunset-coral transition-colors"
              >
                Talk to the coach
              </Link>
              <Link
                href="/resume"
                className="inline-flex h-11 items-center rounded-xl px-5 font-semibold border border-black/10 hover:border-cosmic-teal/40 transition-colors"
              >
                Open resume forge
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
