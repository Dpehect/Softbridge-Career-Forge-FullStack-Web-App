"use client";

import { useCallback, useEffect, useState } from "react";
import { getAiEngineStatus } from "@/app/actions";
import { cn } from "@/lib/utils";

type Props = {
  pollMs?: number;
  className?: string;
};

/** Header: yeşil = Yerel AI Hazır, kırmızı = Bağlantı Yok */
export function AiStatusDot({ pollMs = 10000, className }: Props) {
  const [online, setOnline] = useState<boolean | null>(null);

  const probe = useCallback(async () => {
    try {
      const s = await getAiEngineStatus();
      setOnline(s.online);
    } catch {
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    void probe();
    if (!pollMs) return;
    const id = window.setInterval(() => void probe(), pollMs);
    return () => window.clearInterval(id);
  }, [probe, pollMs]);

  const isOnline = online === true;
  const isUnknown = online === null;

  return (
    <div
      className={cn("inline-flex items-center gap-1.5 rounded-full px-1.5 py-1", className)}
      title={
        isUnknown
          ? "Yerel AI kontrol ediliyor…"
          : isOnline
            ? "Yerel AI Hazır"
            : "Bağlantı Yok — ollama serve"
      }
      role="status"
      aria-label={isOnline ? "Yerel AI Hazır" : "Bağlantı Yok"}
    >
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          isUnknown && "bg-slate-400 animate-pulse",
          isOnline && "bg-green-500",
          !isUnknown && !isOnline && "bg-red-500"
        )}
      />
      <span className="hidden text-[10px] font-semibold tracking-wide text-slate-500 sm:inline">
        {isUnknown ? "AI…" : isOnline ? "AI Hazır" : "Çevrimdışı"}
      </span>
    </div>
  );
}

export default AiStatusDot;
