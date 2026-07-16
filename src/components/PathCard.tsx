"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, Layers3 } from "lucide-react";
import { motion } from "framer-motion";
import type { CareerPath } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useCareerStore } from "@/store/useCareerStore";
import { useTranslation } from "@/lib/forge/i18n";

export function PathCard({ path, index = 0 }: { path: CareerPath; index?: number }) {
  const enrolled = useCareerStore((s) => s.enrolledPathIds.includes(path.id));
  const completedModuleIds = useCareerStore((s) => s.completedModuleIds);
  const { lang } = useTranslation();

  const doneCount = path.modules.filter((m) => completedModuleIds.includes(m.id)).length;
  const progress = path.modules.length > 0 ? Math.round((doneCount / path.modules.length) * 100) : 0;

  // SVG circle calculations
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      className="glass-panel rounded-2xl p-5 flex flex-col h-full group hover:border-cosmic-teal/25 transition-colors text-star-white"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-midnight-void"
          style={{ backgroundColor: path.color }}
        >
          <Layers3 className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-2">
          {enrolled && (
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0" title={`${progress}% complete`}>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  className="stroke-black/5 dark:stroke-white/5 fill-transparent"
                  strokeWidth="3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  className="stroke-cosmic-teal fill-transparent transition-all duration-500"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <span className="absolute text-[8px] font-bold">{progress}%</span>
            </div>
          )}
          <Badge>{path.difficulty}</Badge>
          {enrolled && <Badge variant="accent">{lang === "tr" ? "Kayıtlı" : "Enrolled"}</Badge>}
        </div>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel mb-1">
        {path.track}
      </p>
      <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-cosmic-teal transition-colors text-star-white">
        {path.title}
      </h3>
      <p className="text-sm text-muted-steel leading-relaxed flex-1">{path.summary}</p>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/5">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-steel">
          <Clock className="w-3.5 h-3.5" />
          {path.durationWeeks} {lang === "tr" ? "hafta" : "weeks"} · {path.modules.length} {lang === "tr" ? "modül" : "modules"}
        </span>
        <Link
          href={`/paths/${path.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-cosmic-teal hover:gap-2 transition-all cursor-pointer"
        >
          {lang === "tr" ? "Yola Git" : "Open path"} <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  );
}
