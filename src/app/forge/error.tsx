"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

/**
 * Next.js route error UI for /forge — friendly recovery copy.
 */
export default function ForgeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useMessages();
  const isTr = locale === "tr";

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Forge route error]", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[55vh] items-center justify-center px-4 py-16">
      <div className="surface-panel w-full max-w-md space-y-4 p-8 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--caution-wash)]">
          <AlertTriangle className="h-7 w-7 text-caution" />
        </div>
        <h2 className="text-xl font-extrabold text-ink">
          {isTr ? "Yerel analiz hazırlanıyor" : "Local analysis is preparing"}
        </h2>
        <p className="text-sm leading-relaxed text-ink-2">
          {isTr
            ? "Yerel model veya sayfa bileşeni şu an hazırlanıyor olabilir. Lütfen 5 saniye bekleyip yeniden deneyin — bu oturumdaki CV verileriniz korunuyor."
            : "The local model or page may still be preparing. Wait about 5 seconds and try again — your session resume data is preserved."}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-[var(--action-primary-ink)] hover:bg-brand-strong"
          >
            <RefreshCw className="h-4 w-4" />
            {isTr ? "Yeniden dene" : "Try again"}
          </button>
          <Link
            href="/resume"
            className="inline-flex h-11 items-center rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-ink hover:bg-surface-2"
          >
            {isTr ? "CV Düzenleyici'ye git" : "Open Resume Editor"}
          </Link>
          <Link
            href="/coach"
            className="inline-flex h-11 items-center rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-ink hover:bg-surface-2"
          >
            {isTr ? "Mülakat Koçu" : "Interview Coach"}
          </Link>
        </div>
      </div>
    </div>
  );
}
