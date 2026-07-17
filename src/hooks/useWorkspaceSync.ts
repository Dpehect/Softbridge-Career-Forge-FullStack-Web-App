"use client";

import { useEffect, useRef } from "react";
import { shallow } from "zustand/shallow";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { migrateLegacyWorkspaceOnce } from "@/lib/migrations/migrateLegacyWorkspace";
import { createWorkspaceFingerprint } from "@/lib/supabase/workspace-mapper";
import {
  loadCareerWorkspace,
  saveCareerWorkspace,
  type WorkspaceErrorCode,
} from "@/lib/supabase/workspace";
import { useCareerStore } from "@/store/useCareerStore";

const SAVE_DEBOUNCE_MS = 1_200;

function syncErrorMessage(code: WorkspaceErrorCode, lang: "tr" | "en"): string {
  const tr = {
    aborted: "Senkronizasyon iptal edildi. Tekrar deneyebilirsiniz.",
    auth: "Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.",
    network: "Ağ bağlantısı kurulamadı. Değişiklikleriniz bu oturumda korunuyor.",
    permission: "Çalışma alanını kaydetme izni doğrulanamadı.",
    timeout: "Sunucu zamanında yanıt vermedi. Değişiklikleriniz bu oturumda korunuyor.",
    unknown: "Çalışma alanı senkronize edilemedi. Tekrar deneyin.",
  } satisfies Record<WorkspaceErrorCode, string>;
  const en: Record<WorkspaceErrorCode, string> = {
    aborted: "Sync was cancelled. You can try again.",
    auth: "Your session could not be verified. Please sign in again.",
    network: "The network is unavailable. Your changes remain in this session.",
    permission: "Permission to save this workspace could not be verified.",
    timeout: "The server did not respond in time. Your changes remain in this session.",
    unknown: "The workspace could not be synchronized. Try again.",
  };
  return (lang === "tr" ? tr : en)[code];
}

export function useWorkspaceSync(enabled: boolean) {
  const loadSequence = useRef(0);
  const saveController = useRef<AbortController | null>(null);
  const reloadVersion = useCareerStore((state) => state.cloudReloadVersion);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    const clearSignedOutWorkspace = () => {
      saveController.current?.abort();
      useCareerStore.getState().clearPrivateWorkspace();
    };
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const state = useCareerStore.getState();
      if (event === "SIGNED_OUT" || !session?.user) {
        clearSignedOutWorkspace();
        useCareerStore.setState({ cloudStatus: "local", cloudUserId: null, cloudHydrated: false });
        return;
      }
      if (session.user && state.cloudUserId !== session.user.id) {
        useCareerStore.setState({ cloudUserId: session.user.id });
        state.requestCloudReload();
      }
    });
    window.addEventListener("careerforge:signout", clearSignedOutWorkspace);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("careerforge:signout", clearSignedOutWorkspace);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    const sequence = ++loadSequence.current;
    const state = useCareerStore.getState();
    if (state.isDemoMode) return () => controller.abort();

    async function hydrate() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (controller.signal.aborted || sequence !== loadSequence.current) return;

      if (!session?.user) {
        useCareerStore.setState({ cloudStatus: "local", cloudUserId: null, cloudHydrated: false });
        return;
      }

      useCareerStore.setState({ cloudUserId: session.user.id });
      state.setCloudLoading();

      const preferences = {
        lang: useCareerStore.getState().lang,
        theme: useCareerStore.getState().theme,
      };
      const result = await loadCareerWorkspace(preferences, controller.signal);
      if (controller.signal.aborted || sequence !== loadSequence.current) return;
      if (!result.ok) {
        useCareerStore.getState().markCloudError(
          syncErrorMessage(result.error.code, preferences.lang),
          result.error.code === "network" || result.error.code === "timeout"
        );
        return;
      }

      const { user, workspace } = result.data;
      const current = useCareerStore.getState();
      if (current.cloudUserId && current.cloudUserId !== user.id) current.clearPrivateWorkspace();

      const migration = await migrateLegacyWorkspaceOnce(result.data, preferences, controller.signal);
      if (controller.signal.aborted || sequence !== loadSequence.current) return;
      if (migration.status === "failed") {
        useCareerStore.getState().markCloudError(
          syncErrorMessage(migration.error.code, preferences.lang),
          migration.error.code === "network" || migration.error.code === "timeout"
        );
        return;
      }
      const cloudData = migration.status === "migrated" ? migration.data : result.data.data;
      const targetUpdatedAt = migration.status === "migrated" ? migration.updatedAt : workspace.updated_at;
      const localState = useCareerStore.getState();
      
      const rLocal = localState.resume;
      const localHasData = Boolean(
        rLocal.fullName || rLocal.summary || rLocal.skills.length || rLocal.experience.length || rLocal.education.length ||
        localState.savedJobIds.length || localState.appliedJobIds.length || localState.completedModuleIds.length
      );

      const rCloud = cloudData.resume;
      const cloudHasData = Boolean(
        rCloud.fullName || rCloud.summary || rCloud.skills.length || rCloud.experience.length || rCloud.education.length ||
        cloudData.savedJobIds.length || cloudData.appliedJobIds.length || cloudData.completedModuleIds.length
      );

      if (localHasData && cloudHasData) {
        const localFingerprint = createWorkspaceFingerprint(localState);
        const cloudFingerprint = createWorkspaceFingerprint({ ...localState, ...cloudData });
        if (localFingerprint !== cloudFingerprint) {
          useCareerStore.setState({
            cloudConflictIncoming: cloudData,
            cloudConflictUserId: user.id,
            cloudConflictUpdatedAt: targetUpdatedAt,
            showMigrationDialog: true,
            cloudStatus: "conflict",
          });
          return;
        }
      } else if (localHasData && !cloudHasData) {
        useCareerStore.setState({
          cloudUserId: user.id,
          cloudHydrated: true,
          cloudDirty: true,
          cloudStatus: "saving",
        });
        return;
      }

      useCareerStore.getState().hydrateFromCloud(cloudData, user.id, targetUpdatedAt);
    }

    void hydrate();
    return () => controller.abort();
  }, [enabled, reloadVersion]);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let active = false;
    let queued = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastFingerprint = "";

    const schedule = (delay = SAVE_DEBOUNCE_MS) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void flush(), delay);
    };

    const flush = async () => {
      if (disposed) return;
      if (active) {
        queued = true;
        return;
      }

      const snapshot = useCareerStore.getState();
      if (!snapshot.cloudHydrated || !snapshot.cloudDirty || snapshot.isDemoMode || !snapshot.cloudUserId) return;
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        snapshot.markCloudError("Çevrimdışısınız. Değişiklikler bağlantı gelince kaydedilecek.", true);
        return;
      }

      const fingerprint = createWorkspaceFingerprint(snapshot);
      if (fingerprint === lastFingerprint) {
        snapshot.markCloudSaved(snapshot.cloudChangeVersion, snapshot.cloudLastSyncedAt ?? new Date().toISOString());
        return;
      }

      active = true;
      queued = false;
      const changeVersion = snapshot.cloudChangeVersion;
      snapshot.setCloudSaving();
      const controller = new AbortController();
      saveController.current = controller;
      const result = await saveCareerWorkspace(snapshot, controller.signal);
      if (saveController.current === controller) saveController.current = null;
      active = false;
      if (disposed) return;

      if (result.ok) {
        lastFingerprint = fingerprint;
        useCareerStore.getState().markCloudSaved(changeVersion, result.data.updatedAt);
      } else {
        useCareerStore.getState().markCloudError(
          syncErrorMessage(result.error.code, useCareerStore.getState().lang),
          result.error.code === "network" || result.error.code === "timeout"
        );
      }

      const current = useCareerStore.getState();
      if (queued || current.cloudDirty) schedule(result.ok ? 0 : SAVE_DEBOUNCE_MS * 2);
    };

    const unsubscribe = useCareerStore.subscribe(
      (state) => [state.cloudDirty, state.cloudChangeVersion, state.cloudHydrated, state.isDemoMode] as const,
      () => schedule(),
      { equalityFn: shallow }
    );
    const onOnline = () => {
      const current = useCareerStore.getState();
      if (current.cloudDirty) schedule(0);
      else if (!current.cloudHydrated) current.requestCloudReload();
    };
    const onOffline = () => {
      const current = useCareerStore.getState();
      if (current.cloudDirty) {
        current.markCloudError("Çevrimdışısınız. Değişiklikler bağlantı gelince kaydedilecek.", true);
      }
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const onBeforeUnload = () => {
      if (useCareerStore.getState().cloudDirty) void flush();
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      disposed = true;
      saveController.current?.abort();
      if (timer) clearTimeout(timer);
      unsubscribe();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [enabled]);
}
