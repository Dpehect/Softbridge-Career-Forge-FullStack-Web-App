"use client";

import Link from "next/link";
import { LockKeyhole, ShieldAlert, ShieldCheck } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useMessages } from "@/i18n/useMessages";

interface LoginViewProps {
  configured: boolean;
  nextPath: string;
  errorCode?: string;
}

export function LoginView({ configured, nextPath, errorCode }: LoginViewProps) {
  const { locale, messages } = useMessages();

  return (
    <main className="mx-auto grid min-h-[calc(100vh-10rem)] w-[min(100%-2rem,72rem)] gap-10 py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.7fr)] lg:items-start lg:py-16">
      <section>
        <p className="section-label">{messages.auth.loginKicker}</p>
        <h1 className="page-title-compact mt-4 max-w-2xl">{messages.auth.loginTitle}</h1>
        <p className="page-lede mt-5">{messages.auth.loginBody}</p>

        <div className="mt-9 grid max-w-2xl gap-5 border-t border-line pt-7 sm:grid-cols-2">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-positive" />
            <p className="text-sm leading-6 text-ink-2">{messages.auth.providerNote}</p>
          </div>
          <div className="flex gap-3">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-brand-strong" />
            <p className="text-sm leading-6 text-ink-2">{messages.auth.configuredBy}</p>
          </div>
        </div>
      </section>

      <section className="surface-panel p-6 sm:p-8" aria-labelledby="google-signin-title">
        <p id="google-signin-title" className="text-sm font-semibold text-ink">{messages.auth.signInWithGoogle}</p>
        <p className="mt-2 text-xs leading-5 text-ink-3">{messages.auth.providerNote}</p>

        {errorCode === "callback" && (
          <div className="mt-5 border-l-2 border-negative bg-[var(--negative-wash)] px-4 py-3 text-sm leading-6 text-negative" role="alert">
            {messages.auth.callbackError}
          </div>
        )}

        {!configured && (
          <div className="mt-5 border-l-2 border-caution bg-[var(--caution-wash)] px-4 py-3" role="status">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-caution" />
              <div>
                <p className="text-xs font-semibold text-ink">{messages.auth.configMissing}</p>
                <p className="mt-1 text-xs leading-5 text-ink-2">{messages.auth.configMissingBody}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <GoogleSignInButton nextPath={nextPath} />
        </div>

        <p className="mt-5 text-[0.6875rem] leading-5 text-ink-3">
          {messages.auth.legalPrefix}{" "}
          <Link href="/privacy" className="font-medium text-ink underline decoration-line-strong underline-offset-4">{messages.auth.privacy}</Link>{" "}
          {locale === "en" ? "and the " : "ve "}
          <Link href="/terms" className="font-medium text-ink underline decoration-line-strong underline-offset-4">{messages.auth.terms}</Link>{messages.auth.legalSuffix}
        </p>
      </section>
    </main>
  );
}
