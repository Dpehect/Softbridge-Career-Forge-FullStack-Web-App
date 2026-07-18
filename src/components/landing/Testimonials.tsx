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
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto w-[min(100%-1.25rem,75rem)] sm:w-[min(100%-2.5rem,75rem)]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F766E]">
            Güven
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
            Binlerce iş arayan tarafından tercih ediliyor
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-700">
            Şeffaf skorlar, yerel gizlilik ve net sonraki adımlar — abartısız, yardımcı bir
            çalışma alanı.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-teal-100 bg-[#F0FDFA] px-5 py-8 text-center shadow-sm"
            >
              <p className="text-3xl font-bold tracking-tight text-[#0F766E] sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-7">
          {QUOTES.map((quote, index) => (
            <motion.figure
              key={quote.name}
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              whileHover={prefersReduced ? undefined : { scale: 1.02 }}
              className="flex flex-col rounded-3xl border border-slate-200/80 bg-[#F8FAFC] p-8 shadow-xl shadow-slate-200/40"
            >
              <Quote className="h-6 w-6 text-[#14B8A6]" />
              <blockquote className="mt-4 flex-1 text-[0.975rem] leading-relaxed text-slate-800">
                “{quote.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-5">
                <div>
                  <p className="text-sm font-bold text-slate-900">{quote.name}</p>
                  <p className="text-xs font-medium text-slate-600">{quote.role}</p>
                </div>
                <div className="flex gap-0.5 text-[#FBBF24]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <p className="mt-8 text-center text-xs font-medium text-slate-500">
          * İyileşme oranı örnek / placeholder metriklerdir; kişisel sonuçlar değişebilir.
        </p>
      </div>
    </section>
  );
}
