import {
  createLegacyHydrationData,
  hasMeaningfulLegacyData,
  isWorkspaceEffectivelyEmpty,
  type StoreHydrationData,
} from "@/lib/supabase/workspace-mapper";
import {
  migrateLegacyWorkspace,
  type LoadedWorkspace,
  type WorkspaceServiceError,
} from "@/lib/supabase/workspace";

export const LEGACY_STORAGE_KEY = "softbridge-careerforge";
export const MIGRATION_BACKUP_KEY = "softbridge-careerforge-migration-backup";

type MigrationOutcome =
  | { status: "none" }
  | { status: "migrated"; data: StoreHydrationData; updatedAt: string }
  | { status: "conflict" }
  | { status: "failed"; error: WorkspaceServiceError };

function readLegacyRaw(): string | null {
  try {
    return window.localStorage.getItem(LEGACY_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readLegacyState(raw: string): unknown {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || !("state" in parsed)) return null;
    return (parsed as { state: unknown }).state;
  } catch {
    return null;
  }
}

export function removeLegacyWorkspace() {
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // A blocked storage API does not affect the confirmed remote workspace.
  }
}

export function removeMigrationBackup() {
  try {
    window.localStorage.removeItem(MIGRATION_BACKUP_KEY);
  } catch {
    // The backup can also expire naturally with browser storage.
  }
}

export async function migrateLegacyWorkspaceOnce(
  loaded: LoadedWorkspace,
  fallback: { lang: "tr" | "en"; theme: "light" | "dark" },
  signal?: AbortSignal
): Promise<MigrationOutcome> {
  const raw = readLegacyRaw();
  if (!raw) return { status: "none" };

  const state = readLegacyState(raw);
  if (!state || !hasMeaningfulLegacyData(state)) return { status: "none" };
  const legacy = createLegacyHydrationData(state, fallback);
  if (!legacy) return { status: "none" };

  const remoteHasData = !isWorkspaceEffectivelyEmpty(loaded.workspace);
  if (loaded.workspace.migration_completed_at) {
    if (remoteHasData) removeLegacyWorkspace();
    return { status: "none" };
  }

  if (remoteHasData) {
    try {
      window.localStorage.setItem(MIGRATION_BACKUP_KEY, raw);
    } catch {
      // Keep the original legacy key when a separate backup cannot be created.
    }
    return { status: "conflict" };
  }

  const result = await migrateLegacyWorkspace(legacy, signal);
  if (!result.ok) return { status: "failed", error: result.error };
  removeLegacyWorkspace();
  return { status: "migrated", data: legacy, updatedAt: result.data.updatedAt };
}
