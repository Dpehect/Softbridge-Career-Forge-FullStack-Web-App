"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMessages } from "@/i18n/useMessages";
import { PrivateLocalBadge } from "@/components/PrivateLocalBadge";

export function Footer() {
  const pathname = usePathname();
  const { locale, messages } = useMessages();
  const isTr = locale === "tr";
  if (pathname !== "/") return null;

  return (
    <footer className="border-t border-line bg-surface py-10">
      <div className="mx-auto flex w-[min(100%-2rem,80rem)] flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-lg space-y-3">
            <PrivateLocalBadge />
            <p className="text-sm leading-relaxed text-ink-2">
              {isTr
                ? "Analiz tarayıcında çalışır. CV içeriği sunucuya yüklenmez. Oturum açmadan da Local Storage ile verilerin kalır; istersen hesabınla cihazlar arası senkronize edersin — veriler 256-bit TLS ile korunur ve kontrol sende kalır."
                : "Analysis runs in your browser. Resume content is not uploaded to a server. Without login, data persists in Local Storage; with an account you can sync across devices — traffic is protected with 256-bit TLS and control stays with you."}
            </p>
            <p className="text-xs text-ink-3">{messages.footer.statement}</p>
          </div>
          <nav
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink-2"
            aria-label={messages.footer.menu}
          >
            <Link href="/forge" className="hover:text-brand-strong">
              {messages.nav.analysis}
            </Link>
            <Link href="/jobs" className="hover:text-brand-strong">
              {messages.nav.jobs}
            </Link>
            <Link href="/coach" className="hover:text-brand-strong">
              {messages.nav.coach}
            </Link>
            <Link href="/privacy" className="hover:text-brand-strong">
              {messages.footer.privacy}
            </Link>
            <Link href="/terms" className="hover:text-brand-strong">
              {messages.footer.terms}
            </Link>
            <Link href="/login" className="hover:text-brand-strong">
              {messages.footer.login}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
