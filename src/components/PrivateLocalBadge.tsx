"use client";

import { ShieldCheck } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";
import { cn } from "@/lib/utils";

export function PrivateLocalBadge({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale } = useMessages();
  const isTr = locale === "tr";

  return (
    <span
      className={cn("privacy-badge", className)}
      title={
        isTr
          ? "CV analizi tarayıcınızda çalışır. Ağ sekmesinde CV içeriği sunucuya gönderilmez."
          : "CV analysis runs in your browser. Resume content is not sent to a server."
      }
    >
      <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
      {compact
        ? isTr
          ? "Yerel & Gizli"
          : "Private & Local"
        : isTr
          ? "Private & Local · veriler cihazında"
          : "Private & Local · on-device only"}
    </span>
  );
}
