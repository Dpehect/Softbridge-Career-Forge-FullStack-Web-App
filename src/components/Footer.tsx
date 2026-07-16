"use client";

import Link from "next/link";
import { Anvil } from "lucide-react";
import { useTranslation } from "@/lib/forge/i18n";

/** Single source for footer copy — language follows app toggle (no mixed TR/EN). */
export function Footer() {
  const { t } = useTranslation();

  const productLinks = [
    { href: "/forge", label: t("navForge") },
    { href: "/resume", label: t("navResume") },
    { href: "/jobs", label: t("navJobs") },
    { href: "/paths", label: t("navPaths") },
    { href: "/coach", label: t("navCoach") },
    { href: "/dashboard", label: t("navDashboard") },
  ] as const;

  return (
    <footer className="mt-auto border-t border-black/5 bg-panel-elevated/40">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-cosmic-teal text-midnight-void flex items-center justify-center">
                <Anvil className="w-4 h-4" />
              </div>
              <div>
                <p className="font-display font-bold text-sm tracking-tight">
                  SoftBridge CareerForge
                </p>
                <p className="text-[11px] text-slate-600 dark:text-muted-steel">{t("logoSub")}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-muted-steel max-w-sm leading-relaxed">
              {t("footerTagline")}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-muted-steel mb-3">
              {t("footerProduct")}
            </p>
            <ul className="space-y-2.5 text-sm">
              {productLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-cosmic-teal transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-muted-steel mb-3">
              {t("footerCompany")}
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://www.softbridgesolutions.com"
                  className="hover:text-cosmic-teal transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  SoftBridge Solutions
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-5 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-muted-steel">
          <span>© {new Date().getFullYear()} SoftBridge Solutions · CareerForge</span>
        </div>
      </div>
    </footer>
  );
}
