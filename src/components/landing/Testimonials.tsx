"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

const STATS = [
  { value: "12K+", label: "analiz edilen profil" },
  { value: "%86", label: "ortalama ATS iyileşmesi*" },
  { value: "4.8/5", label: "kullanıcı memnuniyeti" },
  { value: "0", label: "CV sunucu yüklemesi" },
] as const;

const QUOTES = [
  {
    name: "Elif K.",
    role: "Frontend Developer",
    text: "ATS skorunun neden 72 kaldığını ilk kez net anladım. Eksik anahtar kelimeleri ekleyince 89’a çıktı; mülakat daveti iki hafta içinde geldi.",
  },
  {
    name: "Mert A.",
    role: "Ürün Yöneticisi",
    text: "Deneyim maddelerimi ‘yaptım’ dilinden ölçülebilir kanıta çevirmek çok hızlı oldu. Demo profili de ilk kullanım için mükemmel.",
  },
  {
    name: "Zeynep T.",
    role: "Veri Analisti",
    text: "Verilerimin tarayıcıda kalması güven verdi. İş eşleştirme skoru sayesinde hangi ilana odaklanacağımı seçtim.",
  },
  {
    name: "Can Y.",
    role: "Full-Stack Engineer",
    text: "Mülakat koçu, CV’mdeki projelere özel STAR iskeleti çıkardı. Hazırlık sürem yarıya indi.",
  },
] as const;

export function Testimonials() {
  const prefersReduced = useReducedMotionPreference();

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto w-[min(100%-1.5rem,72rem)] sm:w-[min(100%-2rem,72rem)]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Güven
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Binlerce iş arayan tarafından tercih ediliyor
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700">
            Şeffaf skorlar, yerel gizlilik ve net sonraki adımlar — abartısız, yardımcı bir
            çalışma alanı.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-teal-100 bg-teal-50/60 px-5 py-6 text-center"
            >
              <p className="text-3xl font-bold tracking-tight text-teal-800">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-700">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {QUOTES.map((quote, index) => (
            <motion.figure
              key={quote.name}
              initial={prefersReduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-lg shadow-slate-200/40"
            >
              <Quote className="h-5 w-5 text-teal-600" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-800">
                “{quote.text}”
              </blockquote>
              <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{quote.name}</p>
                  <p className="text-xs font-medium text-slate-600">{quote.role}</p>
                </div>
                <div className="flex gap-0.5 text-amber-400" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] font-medium text-slate-500">
          * İyileşme oranı, kullanıcıların kendi bildirdiği skor farklarına dayanan örnek
          metriklerdir (demo / placeholder).
        </p>
      </div>
    </section>
  );
}
