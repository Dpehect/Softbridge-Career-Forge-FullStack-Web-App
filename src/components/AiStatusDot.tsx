"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { preloadBrowserAi, subscribeClientAi, type ClientAiStatus } from "@/lib/clientAi";

export function AiStatusDot({ className }: { className?: string }) {
  const [status, setStatus] = useState<ClientAiStatus>("idle");

  useEffect(() => {
    const unsubscribe = subscribeClientAi((progress) => setStatus(progress.status));
    preloadBrowserAi();
    return unsubscribe;
  }, []);

  const loading = status === "loading";
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-[0.6875rem] font-medium text-ink-3", className)}
      role="status"
      aria-label={loading ? "Asistan hazırlanıyor" : "Asistan hazır"}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", loading ? "bg-caution" : "bg-positive")} />
      {loading ? "Model hazırlanıyor" : "Cihazda hazır"}
    </span>
  );
}

export default AiStatusDot;
