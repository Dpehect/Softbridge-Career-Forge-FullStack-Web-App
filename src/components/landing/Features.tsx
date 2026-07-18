"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  BriefcaseBusiness,
  MessageSquareText,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

const FEATURES = [
  {
    icon: BarChart3,
    title: "ATS Puanlama & Analiz",
    body: "Altı kategoride şeffaf ATS puanı. Neden 86 aldığınızı ve 100 için ne eklemeniz gerektiğini net görürsünüz.",
    href: "/forge",
  },
  {
    icon: Sparkles,
    title: "AI Destekli Öneriler",
    body: "Sorumlulukları kanıta dönüştürün. Önce / sonra örnekleriyle CV maddelerinizi güçlendirin.",
    href: "/resume",
  },
  {
    icon: BriefcaseBusiness,
    title: "Rol Eşleştirme",
    body: "CV’nizdeki becerilere göre uygun ilanları sıralayın, uyum skorunu ve eksik sinyalleri görün.",
    href: "/jobs",
  },
  {
    icon: MessageSquareText,
    title: "Mülakat Koçu",
    body: "CV’nize özel sorular ve STAR cevap iskeleti ile mülakata tek çalışma alanında hazırlanın.",
    href: "/coach",
  },
] as const;

export function Features() {
  const prefersReduced = useReducedMotionPreference();

  return (
    <section id="ozellikler" className="bg-white py-20 sm:py-24">
      <div className="mx-auto w-[min(100%-1.5rem,72rem)] sm:w-[min(100%-2rem,72rem)]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Özellikler
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Başvuru sürecinin tamamı, tek yerde
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700">
            Analizden mülakata kadar adımlar birbirine bağlı. Gereksiz araç karmaşası yok —
            net çıktılar var.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.06 }}
                whileHover={prefersReduced ? undefined : { y: -6, scale: 1.03 }}
                className="group flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/40 transition-shadow hover:shadow-xl hover:shadow-teal-900/10"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100 transition group-hover:bg-teal-700 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold tracking-tight text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-700">
                  {feature.body}
                </p>
                <Link
                  href={feature.href}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-900"
                >
                  Keşfet <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
