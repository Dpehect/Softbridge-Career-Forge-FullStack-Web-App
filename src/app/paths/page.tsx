"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, CheckCircle2, Circle, ChevronDown,
  ChevronUp, ArrowRight, TrendingUp, Award, Layers3,
  Flame,
} from "lucide-react";
import { careerPaths } from "@/data/paths";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCareerStore } from "@/store/useCareerStore";
import { useTranslation } from "@/lib/forge/i18n";
import { cn } from "@/lib/utils";
import type { CareerPath, PathModule } from "@/types";

// ─── Difficulty color map ─────────────────────────────────────────────────────
const DIFF_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  Foundational: { bg: "rgba(74,222,128,0.12)",  text: "#22C55E",  border: "rgba(74,222,128,0.25)" },
  Intermediate: { bg: "rgba(249,115,22,0.12)",  text: "#F97316",  border: "rgba(249,115,22,0.25)" },
  Advanced:     { bg: "rgba(168,85,247,0.12)",  text: "#A855F7",  border: "rgba(168,85,247,0.25)" },
};

// ─── Circular progress ────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 48, color = "#A855F7" }: { pct: number; size?: number; color?: string }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${circ * pct / 100} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <span className="text-[10px] font-black relative z-10" style={{ color }}>{pct}%</span>
    </div>
  );
}

// ─── Module checklist item ────────────────────────────────────────────────────
function ModuleItem({
  module, done, onToggle,
}: { module: PathModule; done: boolean; onToggle: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
        done
          ? "border-soft-green/25"
          : "border-border-color hover:border-cosmic-teal/30"
      )}
      style={{ background: done ? "rgba(74,222,128,0.06)" : "rgba(168,85,247,0.04)" }}
      onClick={onToggle}
    >
      <div className="mt-0.5 shrink-0">
        {done
          ? <CheckCircle2 className="w-4 h-4 text-soft-green" />
          : <Circle className="w-4 h-4 text-muted-steel" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold", done ? "text-muted-steel line-through" : "text-star-white")}>
          {module.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-steel">
          <Clock className="w-3 h-3" />
          <span>{module.durationHours}h</span>
          {module.topics.slice(0, 2).map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
              style={{ background: "rgba(168,85,247,0.1)", color: "#A855F7" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Path card with expandable module list ────────────────────────────────────
function PathCard({ path, index }: { path: CareerPath; index: number }) {
  const { enrolledPathIds, completedModuleIds, enrollPath, toggleModule } = useCareerStore();
  const { lang } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const enrolled = enrolledPathIds.includes(path.id);
  const doneModules = path.modules.filter((m) => completedModuleIds.includes(m.id));
  const progress = path.modules.length > 0 ? Math.round((doneModules.length / path.modules.length) * 100) : 0;
  const diff = DIFF_COLOR[path.difficulty] ?? DIFF_COLOR.Foundational;
  const isTR = lang === "tr";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: "easeOut" }}
      className="glass-panel rounded-3xl overflow-hidden"
    >
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ background: path.color || "#A855F7" }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${path.color || "#A855F7"}20` }}>
              <Layers3 className="w-5 h-5" style={{ color: path.color || "#A855F7" }} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-steel">{path.track}</p>
              <h3 className="font-bold text-star-white leading-tight">{path.title}</h3>
            </div>
          </div>
          {enrolled && <ProgressRing pct={progress} color={path.color || "#A855F7"} />}
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-steel leading-relaxed mb-4">{path.summary}</p>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[10px] font-bold px-2 py-1 rounded-full border"
            style={{ background: diff.bg, color: diff.text, borderColor: diff.border }}>
            {path.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-steel">
            <Clock className="w-3 h-3" />
            {path.durationWeeks} {isTR ? "hafta" : "weeks"}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-steel">
            <BookOpen className="w-3 h-3" />
            {path.modules.length} {isTR ? "modül" : "modules"}
          </span>
          {enrolled && doneModules.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-soft-green">
              <CheckCircle2 className="w-3 h-3" />
              {doneModules.length}/{path.modules.length} {isTR ? "tamamlandı" : "done"}
            </span>
          )}
        </div>

        {/* Skill chips */}
        <div className="flex flex-wrap gap-1 mb-5">
          {path.skills.slice(0, 5).map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full border text-muted-steel"
              style={{ borderColor: "var(--border-color)", background: "rgba(168,85,247,0.05)" }}>
              {s}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 text-white font-bold transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: enrolled
                ? "rgba(249,115,22,0.15)"
                : `linear-gradient(135deg, ${path.color || "#A855F7"}, #C026D3)`,
              color: enrolled ? "#F97316" : "white",
              border: enrolled ? "1px solid rgba(249,115,22,0.3)" : "none",
            }}
            onClick={() => enrollPath(path.id)}
          >
            {enrolled
              ? (isTR ? "Kaydı Kaldır" : "Unenroll")
              : (isTR ? "Kayıt Ol" : "Enroll")
            }
          </Button>

          {enrolled && (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-muted-steel hover:text-star-white text-xs"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded
                ? <><ChevronUp className="w-3.5 h-3.5" /> {isTR ? "Gizle" : "Hide"}</>
                : <><ChevronDown className="w-3.5 h-3.5" /> {isTR ? "Modüller" : "Modules"}</>
              }
            </Button>
          )}

          <Link href={`/paths/${path.id}`}
            className="h-8 w-8 rounded-xl border border-border-color flex items-center justify-center text-muted-steel hover:text-star-white hover:border-cosmic-teal/40 transition-all">
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Expandable module list */}
        <AnimatePresence>
          {enrolled && expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border-color space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-steel mb-2">
                  {isTR ? "Modül İlerlemesi" : "Module Progress"}
                </p>
                {path.modules.map((m) => (
                  <ModuleItem
                    key={m.id}
                    module={m}
                    done={completedModuleIds.includes(m.id)}
                    onToggle={() => toggleModule(m.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PathsPage() {
  const { lang } = useTranslation();
  const { enrolledPathIds, completedModuleIds } = useCareerStore();
  const [mounted, setMounted] = useState(false);
  const [filterDiff, setFilterDiff] = useState<string>("All");
  const isTR = lang === "tr";

  useEffect(() => { setMounted(true); }, []);

  const totalModules = careerPaths.reduce((n, p) => n + p.modules.length, 0);
  const totalDone = careerPaths.reduce(
    (n, p) => n + p.modules.filter((m) => completedModuleIds.includes(m.id)).length, 0
  );
  const overallPct = totalModules > 0 ? Math.round((totalDone / totalModules) * 100) : 0;

  const difficulties = ["All", "Foundational", "Intermediate", "Advanced"];
  const filtered = filterDiff === "All"
    ? careerPaths
    : careerPaths.filter((p) => p.difficulty === filterDiff);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#A855F7", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: "rgba(168,85,247,0.12)", color: "#A855F7" }}>
            <TrendingUp className="w-3.5 h-3.5" />
            {isTR ? "Kariyer Yolları" : "Career Paths"}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-star-white">
            {isTR ? "Hedefine Götüren Yollar 🗺️" : "Paths that lead somewhere 🗺️"}
          </h1>
          <p className="text-muted-steel mt-2 max-w-2xl leading-relaxed">
            {isTR
              ? "Yapılandırılmış öğrenme yolları ile kariyer hedeflerine adım adım ulaş. Modülleri tamamladıkça ilerleme görürsün."
              : "Follow structured learning paths to reach your career goals step by step. Track progress as you complete modules."}
          </p>
        </div>

        {/* Stats bar */}
        {enrolledPathIds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-5 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <ProgressRing pct={overallPct} size={56} color="#A855F7" />
              <div>
                <p className="text-xs text-muted-steel">{isTR ? "Toplam İlerleme" : "Overall Progress"}</p>
                <p className="font-bold text-star-white">{totalDone} / {totalModules} {isTR ? "modül" : "modules"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-steel">
              <Flame className="w-4 h-4 text-sunset-coral" />
              <span>{enrolledPathIds.length} {isTR ? "yola kayıtlısın" : "paths enrolled"}</span>
            </div>
            {overallPct === 100 && (
              <div className="flex items-center gap-2 text-sm font-bold text-soft-green ml-auto">
                <Award className="w-4 h-4" />
                {isTR ? "Tebrikler! Tüm modüller tamamlandı! 🎉" : "All modules complete! 🎉"}
              </div>
            )}
          </motion.div>
        )}

        {/* Difficulty filters */}
        <div className="flex flex-wrap gap-2">
          {difficulties.map((d) => {
            const c = d === "All" ? null : DIFF_COLOR[d];
            const active = filterDiff === d;
            return (
              <button key={d} onClick={() => setFilterDiff(d)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer"
                style={{
                  background: active ? (c ? c.bg : "rgba(168,85,247,0.15)") : "transparent",
                  borderColor: active ? (c ? c.border : "rgba(168,85,247,0.4)") : "var(--border-color)",
                  color: active ? (c ? c.text : "#A855F7") : "var(--text-muted)",
                }}>
                {d === "All" ? (isTR ? "Tümü" : "All") + ` (${careerPaths.length})` : d}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((path, i) => (
            <PathCard key={path.id} path={path} index={i} />
          ))}
        </div>

      </div>
    </div>
  );
}
