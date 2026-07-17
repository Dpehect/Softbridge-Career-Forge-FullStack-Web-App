"use client";

import { useMessages } from "@/i18n/useMessages";
import { getLegalCopy } from "@/i18n/legalCopy";

export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const { locale } = useMessages();
  const copy = getLegalCopy(locale, kind);

  return (
    <main className="mx-auto w-[min(100%-2rem,54rem)] py-12 lg:py-20">
      <article>
        <header className="border-b border-line pb-8">
          <p className="section-label">{copy.kicker}</p>
          <h1 className="page-title-compact mt-4">{copy.title}</h1>
          <p className="page-lede mt-5">{copy.intro}</p>
          <p className="mt-4 text-xs text-ink-3">{copy.updated}</p>
        </header>

        <div className="divide-y divide-line">
          {copy.sections.map((section) => (
            <section key={section.title} className="grid gap-3 py-7 sm:grid-cols-[13rem_1fr] sm:gap-8">
              <h2 className="text-sm font-semibold text-ink">{section.title}</h2>
              <p className="text-sm leading-7 text-ink-2">{section.body}</p>
            </section>
          ))}
        </div>

        <a
          href="https://github.com/Dpehect/Softbridge-Career-Forge-FullStack-Web-App/issues"
          className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-brand-strong underline decoration-line-strong underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          {copy.support}
        </a>
      </article>
    </main>
  );
}
