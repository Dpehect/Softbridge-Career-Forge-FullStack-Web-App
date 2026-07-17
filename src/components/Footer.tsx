"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <footer className="border-t border-line bg-surface py-6">
      <div className="mx-auto flex w-[min(100%-2rem,80rem)] flex-col gap-3 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <p>CareerForge by SoftBridge. Yerel, açık ve aday odaklı.</p>
        <nav className="flex gap-4" aria-label="Alt menü">
          <Link href="/forge" className="hover:text-ink">Analiz</Link>
          <Link href="/jobs" className="hover:text-ink">İşler</Link>
          <Link href="/coach" className="hover:text-ink">Koç</Link>
        </nav>
      </div>
    </footer>
  );
}
