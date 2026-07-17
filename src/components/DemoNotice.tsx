"use client";

import { FlaskConical, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useCareerStore } from "@/store/useCareerStore";
import { useMessages } from "@/i18n/useMessages";

export function DemoNotice() {
  const pathname = usePathname();
  const isDemoMode = useCareerStore((state) => state.isDemoMode);
  const exitDemoMode = useCareerStore((state) => state.exitDemoMode);
  const { messages } = useMessages();

  if (!isDemoMode || ["/login", "/account", "/privacy", "/terms"].includes(pathname)) return null;

  return (
    <div className="border-b border-signal/30 bg-[var(--signal-wash)]" role="status">
      <div className="mx-auto flex min-h-11 w-[min(100%-2rem,80rem)] items-center gap-3 py-2 text-xs text-ink-2">
        <FlaskConical className="h-4 w-4 shrink-0 text-signal" />
        <p className="min-w-0 flex-1"><strong className="font-semibold text-ink">{messages.demo.label}:</strong> {messages.demo.notice}</p>
        <button
          type="button"
          onClick={() => {
            exitDemoMode();
            toast.success(messages.demo.exited);
          }}
          className="inline-flex min-h-11 items-center gap-1.5 px-2 font-semibold text-signal hover:underline"
        >
          <X className="h-3.5 w-3.5" /> {messages.demo.exit}
        </button>
      </div>
    </div>
  );
}
