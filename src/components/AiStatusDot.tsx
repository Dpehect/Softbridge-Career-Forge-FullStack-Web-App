"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { preloadBrowserAi, subscribeClientAi, type ClientAiStatus } from "@/lib/clientAi";

/**
 * Profesyonel durum ışığı — "Beklemede/Hata" gösterme; yeşil "Sistem Hazır".
 */
export function AiStatusDot({ className }: { className?: string }) {
  const [status, setStatus] = useState<ClientAiStatus>("idle");

  useEffect(() => {
    const unsub = subscribeClientAi((p) => setStatus(p.status));
    preloadBrowserAi();
    return () => {
      unsub();
    };
  }, []);

  const warming = status === "loading";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-1 dark:border-emerald-500/25 dark:bg-emerald-500/10",
        className
      )}
      title={
        warming
          ? "Kariyer asistanı hazırlanıyor…"
          : "Sistem Hazır · %100 yerel işleme"
      }
      role="status"
      aria-label="Sistem Hazır"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-70",
            warming ? "bg-amber-400 animate-pulse" : "bg-emerald-500 animate-ping"
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            warming ? "bg-amber-400" : "bg-emerald-500"
          )}
        />
      </span>
      <span
        className={cn(
          "hidden text-[11px] font-semibold tracking-tight sm:inline",
          warming
            ? "text-amber-700 dark:text-amber-300"
            : "text-emerald-800 dark:text-emerald-300"
        )}
      >
        {warming ? "Hazırlanıyor" : "Sistem Hazır"}
      </span>
    </div>
  );
}

export default AiStatusDot;
