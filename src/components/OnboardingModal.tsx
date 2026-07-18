"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FileSearch, Shield, Sparkles, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cf_onboarding_v1_done";

const STEPS = {
  tr: [
    {
      icon: FileSearch,
      title: "CV’ni yükle veya yapıştır",
      body: "PDF/TXT yükle ya da metni yapıştır. Dosya sunucuya gitmez; okuma tarayıcıda yapılır.",
    },
    {
      icon: Sparkles,
      title: "ATS skorunu ve net aksiyonları gör",
      body: "Neden 92 değil 100 aldığını kategori bazında gör. Eksik anahtar kelimeler ve düzeltmeler listelenir.",
    },
    {
      icon: Shield,
      title: "Verilerin burada kalır",
      body: "Çalışma alanın Local Storage’da saklanır — tarayıcıyı kapatsan bile durur. İstersen hesabınla buluta senkronize et.",
    },
  ],
  en: [
    {
      icon: FileSearch,
      title: "Upload or paste your resume",
      body: "Upload PDF/TXT or paste text. The file is not uploaded to a server; parsing happens in your browser.",
    },
    {
      icon: Sparkles,
      title: "See ATS score and clear actions",
      body: "Understand why you scored 92, not 100. Missing keywords and corrections are listed by category.",
    },
    {
      icon: Shield,
      title: "Your data stays here",
      body: "Your workspace is saved in Local Storage — it survives browser restarts. Optionally sync with an account.",
    },
  ],
} as const;

export function OnboardingModal() {
  const { locale } = useMessages();
  const isTr = locale === "tr";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const steps = isTr ? STEPS.tr : STEPS.en;

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
      // Delay slightly so first paint is not blocked
      const t = window.setTimeout(() => setOpen(true), 600);
      return () => window.clearTimeout(t);
    } catch {
      /* ignore */
    }
  }, []);

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const next = () => {
    if (step >= steps.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  };

  const current = steps[step]!;
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            aria-label={isTr ? "Kapat" : "Close"}
            onClick={finish}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-brand">
                {isTr ? "Nasıl çalışır?" : "How it works"} · {step + 1}/3
              </p>
              <button
                type="button"
                onClick={finish}
                className="grid h-9 w-9 place-items-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink"
                aria-label={isTr ? "Atla" : "Skip"}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md">
                <Icon className="h-6 w-6" />
              </div>
              <h2 id="onboarding-title" className="text-xl font-extrabold text-ink">
                {current.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{current.body}</p>

              <div className="mt-6 flex gap-1.5">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= step ? "bg-brand" : "bg-surface-3"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2/60 px-5 py-4">
              <button
                type="button"
                onClick={finish}
                className="text-xs font-semibold text-ink-3 hover:text-ink"
              >
                {isTr ? "Atla" : "Skip"}
              </button>
              <div className="flex gap-2">
                {step === steps.length - 1 ? (
                  <>
                    <Link href="/forge" onClick={finish}>
                      <Button variant="primary" size="sm">
                        {isTr ? "Analiz et" : "Analyze"} <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button variant="primary" size="sm" onClick={next}>
                    {isTr ? "Devam" : "Continue"} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {step === steps.length - 1 && (
              <p className="flex items-center justify-center gap-1.5 px-5 pb-4 text-[11px] font-medium text-positive">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isTr
                  ? "Veriler tarayıcıda kalır — sayfa yenilense bile"
                  : "Data stays in the browser — even after refresh"}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
