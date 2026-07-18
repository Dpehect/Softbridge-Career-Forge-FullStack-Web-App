"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto w-[min(100%-1.5rem,72rem)] sm:w-[min(100%-2rem,72rem)]">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 px-8 py-12 text-center shadow-xl shadow-teal-900/20 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-teal-400/20 blur-2xl" />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
            İlk adımı bugün atın
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm leading-relaxed text-teal-50 sm:text-base">
            CV yükleyin, ATS skorunu görün, net aksiyonlarla ilerleyin — verileriniz
            cihazınızda kalır.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/forge"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-400 px-7 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/30 transition hover:bg-amber-300"
            >
              Ücretsiz ATS analizi
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
            >
              Panele git
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
