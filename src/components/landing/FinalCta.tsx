"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto w-[min(100%-1.25rem,75rem)] sm:w-[min(100%-2.5rem,75rem)]">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F766E] via-[#0D9488] to-[#115E59] px-8 py-14 text-center shadow-2xl shadow-teal-900/25 sm:px-16 sm:py-20">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#FBBF24]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            İlk adımı bugün atın
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-base leading-relaxed text-teal-50 sm:text-lg">
            CV yükleyin, ATS skorunu görün, net aksiyonlarla ilerleyin — verileriniz
            cihazınızda kalır.
          </p>
          <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/forge"
              className="inline-flex min-h-[3.25rem] items-center gap-2 rounded-full bg-[#FBBF24] px-8 text-base font-bold text-slate-900 shadow-xl shadow-amber-400/30 transition hover:scale-[1.03] hover:bg-[#F59E0B]"
            >
              Ücretsiz ATS analizi
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-[3.25rem] items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 text-base font-bold text-white backdrop-blur transition hover:bg-white/15"
            >
              Panele git
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
