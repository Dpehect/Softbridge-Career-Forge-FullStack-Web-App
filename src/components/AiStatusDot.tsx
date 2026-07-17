"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  preloadBrowserAi,
  subscribeClientAi,
  type ClientAiStatus,
} from "@/lib/clientAi";

/**
 * Header pill for browser AI (Transformers.js) — no server calls.
 */
export function AiStatusDot({ className }: { className?: string }) {
  const [status, setStatus] = useState<ClientAiStatus>("idle");
  const [message, setMessage] = useState("Browser AI");

  useEffect(() => {
    const unsub = subscribeClientAi((p) => {
      setStatus(p.status);
      setMessage(p.message);
    });
    preloadBrowserAi();
    return () => {
      unsub();
    };
  }, []);

  const ready = status === "ready";
  const loading = status === "loading";
  const error = status === "error";

  return (
    <div
      className={cn("inline-flex items-center gap-1.5 rounded-full px-1.5 py-1", className)}
      title={message}
      role="status"
      aria-label={message}
    >
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          loading && "bg-amber-400 animate-pulse",
          ready && "bg-green-500",
          error && "bg-red-500",
          status === "idle" && "bg-slate-400"
        )}
      />
      <span className="hidden text-[10px] font-semibold tracking-wide text-slate-500 sm:inline">
        {loading ? "AI loading…" : ready ? "Browser AI" : error ? "AI error" : "AI"}
      </span>
    </div>
  );
}

export default AiStatusDot;
