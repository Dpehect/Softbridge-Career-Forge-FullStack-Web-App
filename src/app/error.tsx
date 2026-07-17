"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale } = useMessages();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[CareerForge] route error", { name: error.name, digest: error.digest });
    }
  }, [error]);

  const copy = locale === "tr" ? {
    title: "Çalışma alanı yüklenemedi",
    body: "Geçici bir sorun oluştu. Bu oturumdaki değişiklikleriniz korunuyor; sayfayı yeniden deneyebilir veya ana sayfaya dönebilirsiniz.",
    retry: "Yeniden dene",
    home: "Ana sayfa",
  } : {
    title: "The workspace could not load",
    body: "A temporary problem occurred. Your current session changes are preserved; try again or return home.",
    retry: "Try again",
    home: "Home",
  };

  return (
    <main className="grid min-h-[70vh] place-items-center px-6 py-16">
      <div className="surface-panel max-w-lg p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-[var(--radius-control)] bg-[var(--negative-wash)] text-negative"><AlertTriangle className="h-5 w-5" /></span>
        <h1 className="mt-5 text-xl font-semibold text-ink">{copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-ink-2">{copy.body}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-brand px-5 text-sm font-semibold text-[var(--action-primary-ink)] hover:bg-brand-strong">
            <RefreshCw className="h-4 w-4" /> {copy.retry}
          </button>
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-5 text-sm font-semibold text-ink hover:bg-surface-2">
            <Home className="h-4 w-4" /> {copy.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
