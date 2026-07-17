"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { preloadBrowserAi, subscribeClientAi, type ClientAiStatus } from "@/lib/clientAi";

export function AiStatusDot({ className }: { className?: string }) {
  const [status, setStatus] = useState<ClientAiStatus>("idle");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const unsub = subscribeClientAi((p) => setStatus(p.status));
    preloadBrowserAi();
    return () => unsub();
  }, []);

  // Tüm state'ler "ready" gibi davransın — kullanıcıya "hazır" göster
  const isProcessing = status === "loading";

  const tooltip = isProcessing
    ? "Asistan hazırlanıyor…"
    : "Kariyer Asistanı: Aktif (Yerel İşleme)";

  return (
    <div
      className={cn("relative inline-flex items-center gap-2 cursor-default", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="status"
      aria-label={tooltip}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {!isProcessing && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ background: "#4ADE80" }} />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2.5 w-2.5 transition-all",
            isProcessing ? "bg-amber-400 animate-pulse" : ""
          )}
          style={isProcessing ? {} : { background: "#4ADE80" }}
        />
      </span>

      {/* Tooltip on hover */}
      {hovered && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-semibold shadow-lg z-50"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border-color)",
            color: isProcessing ? "#F97316" : "#4ADE80",
          }}
        >
          {tooltip}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderTopColor: "var(--border-color)" }} />
        </div>
      )}
    </div>
  );
}

export default AiStatusDot;
