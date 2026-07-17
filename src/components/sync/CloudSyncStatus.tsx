"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { AlertTriangle, Check, Cloud, CloudOff, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeLegacyWorkspace, removeMigrationBackup } from "@/lib/migrations/migrateLegacyWorkspace";
import { markLegacyMigrationCompleted } from "@/lib/supabase/workspace";
import { useCareerStore, type CloudSyncStatus as SyncStatus } from "@/store/useCareerStore";
import { cn } from "@/lib/utils";

const icons: Record<SyncStatus, typeof Cloud> = {
  local: CloudOff,
  idle: Cloud,
  loading: LoaderCircle,
  saving: LoaderCircle,
  saved: Check,
  offline: CloudOff,
  error: AlertTriangle,
  conflict: AlertTriangle,
  demo: CloudOff,
};

export function CloudSyncStatus({ className }: { className?: string }) {
  const [resolving, setResolving] = useState(false);
  const {
    lang,
    cloudStatus,
    cloudError,
    cloudLastSyncedAt,
    markCloudError,
    markCloudSaved,
    retryCloudSync,
  } = useCareerStore(useShallow((state) => ({
    lang: state.lang,
    cloudStatus: state.cloudStatus,
    cloudError: state.cloudError,
    cloudLastSyncedAt: state.cloudLastSyncedAt,
    markCloudError: state.markCloudError,
    markCloudSaved: state.markCloudSaved,
    retryCloudSync: state.retryCloudSync,
  })));
  const isTr = lang === "tr";
  const labels: Record<SyncStatus, string> = isTr ? {
    local: "Sadece yerel (Giriş yapılmadı)",
    idle: "Eşitlenmeyi bekliyor",
    loading: "Eşitleniyor...",
    saving: "Eşitleniyor...",
    saved: "Bulutla eşitlendi",
    offline: "Çevrimdışı",
    error: "Eşitleme başarısız",
    conflict: "Yerel veri çakışması",
    demo: "Demo sürümü (Eşitlenmez)",
  } : {
    local: "Local only (Not signed in)",
    idle: "Waiting to sync",
    loading: "Syncing...",
    saving: "Syncing...",
    saved: "Synced to cloud",
    offline: "Offline",
    error: "Sync failed",
    conflict: "Local data conflict",
    demo: "Demo mode (Not synced)",
  };
  const Icon = icons[cloudStatus];
  const isAnimated = cloudStatus === "loading" || cloudStatus === "saving";
  const isProblem = cloudStatus === "error" || cloudStatus === "offline" || cloudStatus === "conflict";

  const keepCloudVersion = async () => {
    setResolving(true);
    const result = await markLegacyMigrationCompleted();
    setResolving(false);
    if (!result.ok) {
      markCloudError(
        isTr ? "Çakışma çözülemedi. Bağlantınızı kontrol edip tekrar deneyin." : "The conflict could not be resolved. Check your connection and try again.",
        result.error.code === "network" || result.error.code === "timeout"
      );
      return;
    }
    removeLegacyWorkspace();
    removeMigrationBackup();
    const state = useCareerStore.getState();
    markCloudSaved(state.cloudChangeVersion, result.data.updatedAt);
  };

  return (
    <div
      className={cn("flex min-w-0 flex-wrap items-center gap-2 text-[0.6875rem] text-ink-3", className)}
      role={isProblem ? "status" : undefined}
      aria-live={isProblem ? "polite" : "off"}
    >
      <span className={cn("inline-flex items-center gap-1.5", isProblem && "text-caution")}>
        <Icon className={cn("h-3.5 w-3.5 shrink-0", isAnimated && "animate-spin")} />
        <span>{labels[cloudStatus]}</span>
      </span>
      {cloudStatus === "saved" && cloudLastSyncedAt && (
        <span className="sr-only">{new Date(cloudLastSyncedAt).toLocaleString(isTr ? "tr-TR" : "en-US")}</span>
      )}
      {(cloudStatus === "error" || cloudStatus === "offline") && (
        <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-[0.6875rem]" onClick={retryCloudSync}>
          <RefreshCw className="h-3.5 w-3.5" />{isTr ? "Yeniden dene" : "Retry"}
        </Button>
      )}
      {cloudStatus === "conflict" && (
        <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[0.6875rem]" disabled={resolving} onClick={keepCloudVersion}>
          {resolving && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
          {isTr ? "Bulut sürümünü koru" : "Keep cloud version"}
        </Button>
      )}
      {isProblem && cloudError && <span className="basis-full text-ink-3">{cloudError}</span>}
    </div>
  );
}
