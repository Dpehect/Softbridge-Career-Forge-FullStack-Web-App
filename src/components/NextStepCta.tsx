"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/useMessages";
import { cn } from "@/lib/utils";

type NextStepCtaProps = {
  title: string;
  body?: string;
  href: string;
  actionLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function NextStepCta({
  title,
  body,
  href,
  actionLabel,
  secondaryHref,
  secondaryLabel,
  className,
}: NextStepCtaProps) {
  const { locale } = useMessages();
  const isTr = locale === "tr";

  return (
    <div className={cn("next-step-bar", className)}>
      <div className="min-w-0">
        <p className="section-label">{isTr ? "Sıradaki adım" : "Next step"}</p>
        <h3 className="mt-1.5 text-base font-bold text-ink">{title}</h3>
        {body ? <p className="mt-1 max-w-xl text-sm leading-6 text-ink-2">{body}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref}>
            <Button variant="outline" size="sm">
              {secondaryLabel}
            </Button>
          </Link>
        ) : null}
        <Link href={href}>
          <Button variant="primary" size="sm">
            {actionLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
