"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

const FEATURES = [
  {
    icon: BarChart3,
    title: "ATS Puanlama & Analiz",
    body: "Altı kategoride şeffaf ATS puanı. Neden bu skoru aldığınızı ve 100 için ne eklemeniz gerektiğini net görün.",
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
    body: "CV’nizdeki becerilere göre uygun ilanları sıralayın; uyum skorunu ve eksik sinyalleri görün.",
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
    <section id="ozellikler" className="bg-white py-24 sm:py-32">
      <div className="mx-auto w-[min(100%-1.25rem,75rem)] sm:w-[min(100%-2.5rem,75rem)]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F766E]">
            Özellikler
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
            Başvuru sürecinin tamamı, tek yerde
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-700">
            Analizden mülakata kadar adımlar birbirine bağlı. Gereksiz araç karmaşası yok —
            net çıktılar var.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={prefersReduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.07, duration: 0.4 }}
                whileHover={
                  prefersReduced
                    ? undefined
                    : { scale: 1.05, y: -4, transition: { type: "spring", stiffness: 320, damping: 20 } }
                }
                className="group flex flex-col rounded-3xl border border-slate-200/70 bg-white p-7 shadow-xl shadow-slate-200/50 transition-shadow hover:shadow-2xl hover:shadow-teal-900/10"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDFA] text-[#0F766E] ring-1 ring-teal-100 transition group-hover:bg-[#0F766E] group-hover:text-white group-hover:ring-teal-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-slate-700">
                  {feature.body}
                </p>
                <Link
                  href={feature.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#0F766E] transition group-hover:gap-2.5"
                >
                  Keşfet
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
