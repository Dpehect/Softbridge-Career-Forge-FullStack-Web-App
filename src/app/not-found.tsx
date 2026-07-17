"use client";

import Link from "next/link";
import { FileSearch, Home } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

export default function NotFoundPage() {
  const { locale, messages } = useMessages();
  const copy = locale === "tr" ? {
    title: "Bu sayfa bulunamadı",
    body: "Bağlantı değişmiş veya sayfa kaldırılmış olabilir. Kariyer çalışma alanınıza güvenle dönebilirsiniz.",
    home: "Ana sayfaya dön",
  } : {
    title: "This page was not found",
    body: "The link may have changed or the page may have been removed. You can safely return to your career workspace.",
    home: "Return home",
  };
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 py-16">
      <div className="max-w-lg text-center">
        <p className="metric-number text-6xl font-semibold text-brand-strong">404</p>
        <h1 className="mt-5 text-2xl font-semibold text-ink">{copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-ink-2">{copy.body}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-brand px-5 text-sm font-semibold text-[var(--action-primary-ink)] hover:bg-brand-strong"><Home className="h-4 w-4" /> {copy.home}</Link>
          <Link href="/forge" className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-5 text-sm font-semibold text-ink hover:bg-surface-2"><FileSearch className="h-4 w-4" /> {messages.nav.analysis}</Link>
        </div>
      </div>
    </main>
  );
}
