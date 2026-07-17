"use client";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  createProfileUpdateFromState,
  createStoreHydrationData,
  createWorkspaceUpsertFromState,
  type StoreHydrationData,
  type WorkspaceStateSnapshot,
} from "@/lib/supabase/workspace-mapper";
import type { CareerState } from "@/store/useCareerStore";
import type { CareerWorkspaceRow, ProfileRow } from "@/types/database";

const REQUEST_TIMEOUT_MS = 12_000;

export type WorkspaceErrorCode =
  | "aborted"
  | "auth"
  | "network"
  | "permission"
  | "timeout"
  | "unknown";

export interface WorkspaceServiceError {
  code: WorkspaceErrorCode;
  retryable: boolean;
}

export type WorkspaceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: WorkspaceServiceError };

export interface LoadedWorkspace {
  user: User;
  profile: ProfileRow;
  workspace: CareerWorkspaceRow;
  data: StoreHydrationData;
}

let activeSave: Promise<WorkspaceResult<{ updatedAt: string }>> | null = null;

function authenticatedName(user: User): string {
  const metadata = user.user_metadata;
  const value = metadata?.full_name ?? metadata?.name;
  return typeof value === "string" ? value.trim() : "";
}

function serviceError(error: unknown): WorkspaceServiceError {
  if (error instanceof DOMException && error.name === "AbortError") {
    return { code: "aborted", retryable: true };
  }

  const candidate = error as { code?: string; message?: string; status?: number } | null;
  const code = candidate?.code?.toLowerCase() ?? "";
  const message = candidate?.message?.toLowerCase() ?? "";

  if (code === "timeout" || message.includes("timeout")) {
    return { code: "timeout", retryable: true };
  }
  if (candidate?.status === 401 || message.includes("jwt") || message.includes("auth session")) {
    return { code: "auth", retryable: false };
  }
  if (candidate?.status === 403 || code === "42501" || message.includes("row-level security")) {
    return { code: "permission", retryable: false };
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { code: "network", retryable: true };
  }
  if (message.includes("fetch") || message.includes("network")) {
    return { code: "network", retryable: true };
  }

  return { code: "unknown", retryable: true };
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
}

async function withTimeout<T>(
  operation: (signal: AbortSignal) => PromiseLike<T>,
  externalSignal?: AbortSignal
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  externalSignal?.addEventListener("abort", onAbort, { once: true });

  try {
    return await operation(controller.signal);
  } catch (error) {
    if (timedOut) throw { code: "timeout", message: "timeout" };
    throw error;
  } finally {
    window.clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", onAbort);
  }
}

async function requireUser(signal?: AbortSignal): Promise<User> {
  throwIfAborted(signal);
  const { data, error } = await createClient().auth.getUser();
  throwIfAborted(signal);
  if (error || !data.user) {
    throw { status: 401, message: error?.message ?? "Auth session missing" };
  }
  return data.user;
}

async function ensureUserRows(user: User, signal: AbortSignal) {
  const supabase = createClient();
  const [profileResult, workspaceResult] = await Promise.all([
    supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: authenticatedName(user) || null }, { onConflict: "id", ignoreDuplicates: true })
      .select("id")
      .abortSignal(signal),
    supabase
      .from("career_workspaces")
      .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true })
      .select("user_id")
      .abortSignal(signal),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (workspaceResult.error) throw workspaceResult.error;
}

export async function loadCareerWorkspace(
  fallback: { lang: "tr" | "en"; theme: "light" | "dark" },
  externalSignal?: AbortSignal
): Promise<WorkspaceResult<LoadedWorkspace>> {
  try {
    const data = await withTimeout(async (signal) => {
      const user = await requireUser(signal);
      await ensureUserRows(user, signal);

      const supabase = createClient();
      const [profileResult, workspaceResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).abortSignal(signal).single(),
        supabase.from("career_workspaces").select("*").eq("user_id", user.id).abortSignal(signal).single(),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (workspaceResult.error) throw workspaceResult.error;

      return {
        user,
        profile: profileResult.data,
        workspace: workspaceResult.data,
        data: createStoreHydrationData(profileResult.data, workspaceResult.data, fallback),
      };
    }, externalSignal);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: serviceError(error) };
  }
}

async function performSave(
  state: CareerState,
  externalSignal?: AbortSignal
): Promise<WorkspaceResult<{ updatedAt: string }>> {
  if (state.isDemoMode) {
    return { ok: true, data: { updatedAt: new Date().toISOString() } };
  }

  try {
    const data = await withTimeout(async (signal) => {
      const user = await requireUser(signal);
      const supabase = createClient();
      const name = authenticatedName(user);
      const [profileResult, workspaceResult] = await Promise.all([
        supabase
          .from("profiles")
          .upsert(
            { id: user.id, ...createProfileUpdateFromState(state, name) },
            { onConflict: "id" }
          )
          .select("updated_at")
          .abortSignal(signal)
          .single(),
        supabase
          .from("career_workspaces")
          .upsert(createWorkspaceUpsertFromState(state, user.id), { onConflict: "user_id" })
          .select("updated_at")
          .abortSignal(signal)
          .single(),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (workspaceResult.error) throw workspaceResult.error;
      return { updatedAt: workspaceResult.data.updated_at };
    }, externalSignal);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: serviceError(error) };
  }
}

export function saveCareerWorkspace(
  state: CareerState,
  externalSignal?: AbortSignal
): Promise<WorkspaceResult<{ updatedAt: string }>> {
  if (activeSave) return activeSave;
  activeSave = performSave(state, externalSignal).finally(() => {
    activeSave = null;
  });
  return activeSave;
}

export async function updateProfilePreferences(
  state: WorkspaceStateSnapshot,
  externalSignal?: AbortSignal
): Promise<WorkspaceResult<{ updatedAt: string }>> {
  try {
    const data = await withTimeout(async (signal) => {
      const user = await requireUser(signal);
      const { data: profile, error } = await createClient()
        .from("profiles")
        .upsert(
          { id: user.id, ...createProfileUpdateFromState(state, authenticatedName(user)) },
          { onConflict: "id" }
        )
        .select("updated_at")
        .abortSignal(signal)
        .single();
      if (error) throw error;
      return { updatedAt: profile.updated_at };
    }, externalSignal);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: serviceError(error) };
  }
}

export async function markLegacyMigrationCompleted(
  externalSignal?: AbortSignal
): Promise<WorkspaceResult<{ updatedAt: string }>> {
  try {
    const data = await withTimeout(async (signal) => {
      const user = await requireUser(signal);
      const { data: workspace, error } = await createClient()
        .from("career_workspaces")
        .update({ migration_completed_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .select("updated_at")
        .abortSignal(signal)
        .single();
      if (error) throw error;
      return { updatedAt: workspace.updated_at };
    }, externalSignal);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: serviceError(error) };
  }
}

export async function migrateLegacyWorkspace(
  state: WorkspaceStateSnapshot,
  externalSignal?: AbortSignal
): Promise<WorkspaceResult<{ updatedAt: string }>> {
  try {
    const data = await withTimeout(async (signal) => {
      const user = await requireUser(signal);
      const supabase = createClient();
      const [profileResult, workspaceResult] = await Promise.all([
        supabase
          .from("profiles")
          .upsert(
            { id: user.id, ...createProfileUpdateFromState(state, authenticatedName(user)) },
            { onConflict: "id" }
          )
          .select("id")
          .abortSignal(signal),
        supabase
          .from("career_workspaces")
          .upsert(
            {
              ...createWorkspaceUpsertFromState(state, user.id),
              migration_completed_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          )
          .select("updated_at")
          .abortSignal(signal)
          .single(),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (workspaceResult.error) throw workspaceResult.error;
      return { updatedAt: workspaceResult.data.updated_at };
    }, externalSignal);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: serviceError(error) };
  }
}

export async function deleteUserWorkspaceData(
  externalSignal?: AbortSignal
): Promise<WorkspaceResult<null>> {
  try {
    await withTimeout(async (signal) => {
      const user = await requireUser(signal);
      const supabase = createClient();
      const { error } = await supabase
        .from("career_workspaces")
        .delete()
        .eq("user_id", user.id)
        .abortSignal(signal);
      if (error) throw error;
    }, externalSignal);
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: serviceError(error) };
  }
}

export async function clearRemoteWorkspace(
  state: WorkspaceStateSnapshot,
  externalSignal?: AbortSignal
): Promise<WorkspaceResult<{ updatedAt: string }>> {
  try {
    const data = await withTimeout(async (signal) => {
      const user = await requireUser(signal);
      const { data: workspace, error } = await createClient()
        .from("career_workspaces")
        .upsert(createWorkspaceUpsertFromState(state, user.id), { onConflict: "user_id" })
        .select("updated_at")
        .abortSignal(signal)
        .single();
      if (error) throw error;
      return { updatedAt: workspace.updated_at };
    }, externalSignal);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: serviceError(error) };
  }
}
