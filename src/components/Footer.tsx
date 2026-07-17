"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMessages } from "@/i18n/useMessages";

export function Footer() {
  const pathname = usePathname();
  const { messages } = useMessages();
  if (pathname !== "/") return null;

  return (
    <footer className="border-t border-line bg-surface py-6">
      <div className="mx-auto flex w-[min(100%-2rem,80rem)] flex-col gap-3 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{messages.footer.statement}</p>
        <nav className="flex gap-4" aria-label={messages.footer.menu}>
          <Link href="/forge" className="hover:text-ink">{messages.nav.analysis}</Link>
          <Link href="/jobs" className="hover:text-ink">{messages.nav.jobs}</Link>
          <Link href="/coach" className="hover:text-ink">{messages.nav.coach}</Link>
        </nav>
      </div>
    </footer>
  );
}
