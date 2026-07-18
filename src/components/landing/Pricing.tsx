"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

const FREE = [
  "Sınırsız yerel ATS analizi",
  "CV editörü & A4 önizleme",
  "Demo iş ilanları & uyum skoru",
  "Temel mülakat soruları",
  "Veriler tarayıcıda kalır",
] as const;

const PREMIUM = [
  "Free planın tümü",
  "Bulut senkronizasyonu (hesap ile)",
  "Gelişmiş STAR koç akışları",
  "Sürüm geçmişi & yedekler",
  "Öncelikli özellik erişimi",
  "Çoklu cihaz çalışma alanı",
] as const;

export function Pricing() {
  const prefersReduced = useReducedMotionPreference();

  return (
    <section id="pricing" className="bg-[#F8FAFC] py-24 sm:py-32">
      <div className="mx-auto w-[min(100%-1.25rem,75rem)] sm:w-[min(100%-2.5rem,75rem)]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F766E]">
            Fiyatlandırma
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
            Hangi plan size uygun?
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-700">
            Yerel analiz her zaman ücretsiz. Premium; cihazlar arası senkron ve gelişmiş
            koçluk için.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col rounded-3xl border border-slate-200 bg-white p-9 shadow-xl shadow-slate-200/50"
          >
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Free</p>
            <p className="mt-3 text-5xl font-bold tracking-tight text-slate-900">
              ₺0
              <span className="text-lg font-semibold text-slate-500"> / sonsuza dek</span>
            </p>
            <p className="mt-3 text-[0.975rem] text-slate-700">
              Bireysel iş arayanlar için tam yerel çalışma alanı.
            </p>
            <ul className="mt-10 space-y-3.5">
              {FREE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.975rem] font-medium text-slate-800">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#14B8A6]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/forge"
              className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-base font-bold text-slate-900 transition hover:scale-[1.02] hover:border-[#0F766E] hover:text-[#0F766E]"
            >
              Ücretsiz başla
            </Link>
          </motion.div>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="relative flex flex-col rounded-3xl border-2 border-[#0F766E] bg-gradient-to-b from-[#0F766E] to-[#115E59] p-9 text-white shadow-2xl shadow-teal-900/30"
          >
            <span className="absolute -top-3.5 right-7 inline-flex items-center gap-1.5 rounded-full bg-[#FBBF24] px-3.5 py-1.5 text-xs font-extrabold text-slate-900 shadow-lg">
              <Sparkles className="h-3.5 w-3.5" />
              Önerilen
            </span>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-100">Premium</p>
            <p className="mt-3 text-5xl font-bold tracking-tight">
              Yakında
              <span className="text-lg font-semibold text-teal-200"> · erken erişim</span>
            </p>
            <p className="mt-3 text-[0.975rem] text-teal-50/95">
              Senkron, yedek ve gelişmiş koç için hesabınızı bağlayın.
            </p>
            <ul className="mt-10 space-y-3.5">
              {PREMIUM.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.975rem] font-medium text-teal-50">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#FBBF24]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full bg-[#FBBF24] text-base font-bold text-slate-900 shadow-lg shadow-amber-400/30 transition hover:scale-[1.02] hover:bg-[#F59E0B]"
            >
              Hesap oluştur / Giriş yap
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
