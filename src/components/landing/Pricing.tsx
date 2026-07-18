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
    <section id="pricing" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto w-[min(100%-1.5rem,72rem)] sm:w-[min(100%-2rem,72rem)]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Fiyatlandırma
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Hangi plan size uygun?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-700">
            Yerel analiz her zaman ücretsiz. Premium, cihazlar arası senkron ve gelişmiş
            koçluk için.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 lg:grid-cols-2">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50"
          >
            <p className="text-sm font-bold text-slate-600">Free</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
              ₺0
              <span className="text-base font-semibold text-slate-500"> / sonsuza dek</span>
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Bireysel iş arayanlar için tam yerel çalışma alanı.
            </p>
            <ul className="mt-8 space-y-3">
              {FREE.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm font-medium text-slate-800">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/forge"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-sm font-bold text-slate-900 transition hover:border-teal-600 hover:text-teal-800"
            >
              Ücretsiz başla
            </Link>
          </motion.div>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="relative flex flex-col rounded-3xl border-2 border-teal-600 bg-gradient-to-b from-teal-800 to-teal-900 p-8 text-white shadow-xl shadow-teal-900/30"
          >
            <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-extrabold text-slate-900 shadow-md">
              <Sparkles className="h-3 w-3" />
              Önerilen
            </span>
            <p className="text-sm font-bold text-teal-100">Premium</p>
            <p className="mt-2 text-4xl font-bold tracking-tight">
              Yakında
              <span className="text-base font-semibold text-teal-200"> · erken erişim</span>
            </p>
            <p className="mt-2 text-sm text-teal-50/90">
              Senkron, yedek ve gelişmiş koç için hesabınızı bağlayın.
            </p>
            <ul className="mt-8 space-y-3">
              {PREMIUM.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm font-medium text-teal-50">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition hover:bg-amber-300"
            >
              Hesap oluştur / Giriş yap
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
