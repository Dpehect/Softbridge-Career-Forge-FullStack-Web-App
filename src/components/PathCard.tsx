"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, Layers3 } from "lucide-react";
import { motion } from "framer-motion";
import type { CareerPath } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useCareerStore } from "@/store/useCareerStore";

export function PathCard({ path, index = 0 }: { path: CareerPath; index?: number }) {
  const enrolled = useCareerStore((s) => s.enrolledPathIds.includes(path.id));

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      className="glass-panel rounded-2xl p-5 flex flex-col h-full group hover:border-cosmic-teal/25 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-midnight-void"
          style={{ backgroundColor: path.color }}
        >
          <Layers3 className="w-5 h-5" />
        </div>
        <div className="flex gap-1.5">
          <Badge>{path.difficulty}</Badge>
          {enrolled && <Badge variant="accent">Enrolled</Badge>}
        </div>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel mb-1">
        {path.track}
      </p>
      <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-cosmic-teal transition-colors">
        {path.title}
      </h3>
      <p className="text-sm text-muted-steel leading-relaxed flex-1">{path.summary}</p>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/5">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-steel">
          <Clock className="w-3.5 h-3.5" />
          {path.durationWeeks} weeks · {path.modules.length} modules
        </span>
        <Link
          href={`/paths/${path.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-cosmic-teal hover:gap-2 transition-all"
        >
          Open path <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  );
}
