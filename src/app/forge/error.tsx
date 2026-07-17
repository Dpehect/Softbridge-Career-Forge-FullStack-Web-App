"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

/**
 * Next.js route error UI for /forge — soft recovery, Turkish copy.
 */
export default function ForgeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useMessages();
  useEffect(() => {
    console.error("[Forge route error]", error);
  }, [error]);

  return (
    <div className="min-h-[55vh] flex items-center justify-center px-4 py-16">
      <div className="surface-panel w-full max-w-md space-y-4 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--radius-control)] bg-[var(--caution-wash)]">
          <AlertTriangle className="h-7 w-7 text-caution" />
        </div>
        <h2 className="text-xl font-semibold text-ink">
          {locale === "tr" ? "CV analizi yüklenemedi" : "Resume analysis could not load"}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          {locale === "tr" ? "Geçici bir sorun oluştu. Bu oturumdaki değişiklikleriniz korunuyor; yeniden deneyebilir veya CV Düzenleyici'ye geçebilirsiniz." : "A temporary problem occurred. Your current session changes are preserved; try again or continue to Resume Editor."}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-control)] bg-brand px-5 text-sm font-bold text-[var(--action-primary-ink)] hover:bg-brand-strong"
          >
            <RefreshCw className="w-4 h-4" />
            {locale === "tr" ? "Yeniden dene" : "Try again"}
          </button>
          <Link
            href="/resume"
            className="inline-flex h-11 items-center rounded-[var(--radius-control)] border border-line bg-surface px-5 text-sm font-semibold text-ink hover:bg-surface-2"
          >
            {locale === "tr" ? "CV Düzenleyici'ye git" : "Open Resume Editor"}
          </Link>
        </div>
      </div>
    </div>
  );
}
