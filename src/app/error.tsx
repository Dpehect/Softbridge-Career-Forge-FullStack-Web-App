"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

export default function ErrorPage({
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
      console.error("[CareerForge] route error", { name: error.name, digest: error.digest });
    }
  }, [error]);

  const copy = isTr
    ? {
        title: "Bir an durakladık",
        body: "Yerel model veya çalışma alanı şu an hazırlanıyor olabilir. Lütfen 5 saniye bekleyip yeniden deneyin — bu oturumdaki verileriniz korunuyor.",
        retry: "5 sn sonra dene",
        home: "Ana sayfa",
      }
    : {
        title: "We hit a brief pause",
        body: "The local model or workspace may still be preparing. Wait about 5 seconds and try again — your session data is preserved.",
        retry: "Try again",
        home: "Home",
      };

  return (
    <main className="grid min-h-[70vh] place-items-center px-6 py-16">
      <div className="surface-panel max-w-lg p-8 text-center sm:p-10">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[var(--caution-wash)] text-caution">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-ink">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">{copy.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-[var(--action-primary-ink)] hover:bg-brand-strong"
          >
            <RefreshCw className="h-4 w-4" /> {copy.retry}
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-bold text-ink hover:bg-surface-2"
          >
            <Home className="h-4 w-4" /> {copy.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
