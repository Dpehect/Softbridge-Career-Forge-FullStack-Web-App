"use client";

import Link from "next/link";
import { CheckCircle2, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useMessages } from "@/i18n/useMessages";
import { cn } from "@/lib/utils";

interface AccountViewProps {
  email: string;
  name: string;
  provider: string;
}

export function AccountView({ email, name, provider }: AccountViewProps) {
  const { messages } = useMessages();

  return (
    <main className="mx-auto min-h-[calc(100vh-10rem)] w-[min(100%-2rem,64rem)] py-12 lg:py-20">
      <p className="section-label">{messages.auth.accountKicker}</p>
      <h1 className="page-title-compact mt-4 max-w-3xl">{messages.auth.accountTitle}</h1>
      <p className="page-lede mt-5">{messages.auth.accountBody}</p>

      <div className="mt-10 grid gap-8 border-t border-line pt-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-labelledby="account-details-title">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--accent-wash)] text-brand-strong">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <h2 id="account-details-title" className="text-base font-semibold text-ink">{name}</h2>
              <p className="mt-1 text-sm text-ink-3">{messages.auth.signedInAs}</p>
            </div>
          </div>

          <dl className="mt-8 divide-y divide-line border-y border-line">
            <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <dt className="text-xs font-medium text-ink-3">{messages.auth.email}</dt>
              <dd className="text-sm text-ink">{email}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <dt className="text-xs font-medium text-ink-3">{messages.auth.provider}</dt>
              <dd className="text-sm text-ink">{provider === "google" ? messages.auth.google : provider}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <dt className="text-xs font-medium text-ink-3">{messages.auth.session}</dt>
              <dd className="flex items-center gap-2 text-sm text-positive"><CheckCircle2 className="h-4 w-4" />{messages.auth.sessionActive}</dd>
            </div>
          </dl>
        </section>

        <aside className="surface-subtle p-5">
          <ShieldCheck className="h-5 w-5 text-positive" />
          <p className="mt-3 text-xs leading-5 text-ink-2">{messages.auth.configuredBy}</p>
          <div className="mt-6 grid gap-2">
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "primary" }), "w-full")}>{messages.auth.continueWorkspace}</Link>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="outline" className="w-full"><LogOut className="h-4 w-4" />{messages.auth.signOut}</Button>
            </form>
          </div>
        </aside>
      </div>
    </main>
  );
}
