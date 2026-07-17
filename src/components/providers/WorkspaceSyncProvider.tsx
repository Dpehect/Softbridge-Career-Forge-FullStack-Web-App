"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useWorkspaceSync } from "@/hooks/useWorkspaceSync";
import { isProtectedWorkspacePath } from "@/lib/auth/protected-routes";
import { useCareerStore } from "@/store/useCareerStore";
import { CloudSyncStatus } from "@/components/sync/CloudSyncStatus";

function subscribeToPersist(notify: () => void) {
  const stopHydrating = useCareerStore.persist.onHydrate(() => notify());
  const stopFinished = useCareerStore.persist.onFinishHydration(() => notify());
  return () => {
    stopHydrating();
    stopFinished();
  };
}

export function WorkspaceSyncProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const uiHydrated = useSyncExternalStore(
    subscribeToPersist,
    () => useCareerStore.persist.hasHydrated(),
    () => false
  );
  const requiresSync = isProtectedWorkspacePath(pathname);
  const enabled = uiHydrated && requiresSync;
  const cloudStatus = useCareerStore((state) => state.cloudStatus);
  const cloudHydrated = useCareerStore((state) => state.cloudHydrated);
  useWorkspaceSync(enabled);
  const showLoadingGate = enabled && !cloudHydrated && (cloudStatus === "idle" || cloudStatus === "loading");
  const showGlobalStatus = enabled && ["offline", "error", "conflict"].includes(cloudStatus);

  return (
    <>
      {children}
      {showLoadingGate && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-background/90 px-6" aria-busy="true">
          <CloudSyncStatus className="border border-line bg-surface px-4 py-3 shadow-lg" />
        </div>
      )}
      {showGlobalStatus && (
        <div className="fixed bottom-20 right-4 z-[60] max-w-[min(24rem,calc(100vw-2rem))] border border-line bg-surface px-4 py-3 shadow-lg md:bottom-4">
          <CloudSyncStatus />
        </div>
      )}
    </>
  );
}
