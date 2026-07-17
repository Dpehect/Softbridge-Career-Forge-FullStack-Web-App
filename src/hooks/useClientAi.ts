"use client";

import { useCallback, useEffect, useState } from "react";
import {
  analyzeCvJobInBrowser,
  preloadBrowserAi,
  subscribeClientAi,
  type ClientAiProgress,
  type SemanticMatchResult,
} from "@/lib/clientAi";

/**
 * React hook for Transformers.js browser AI.
 */
export function useClientAi() {
  const [progress, setProgress] = useState<ClientAiProgress>({
    status: "idle",
    message: "Kariyer asistanı",
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SemanticMatchResult | null>(null);

  useEffect(() => {
    const unsub = subscribeClientAi(setProgress);
    // Warm model in background when any consumer mounts
    preloadBrowserAi();
    return () => {
      unsub();
    };
  }, []);

  const ensureReady = useCallback(async () => {
    setError(null);
    const { loadBrowserAi } = await import("@/lib/clientAi");
    await loadBrowserAi();
  }, []);

  const analyze = useCallback(
    async (cvText: string, jobDescription: string, skills: string[] = []) => {
      setAnalyzing(true);
      setError(null);
      try {
        const result = await analyzeCvJobInBrowser(cvText, jobDescription, skills);
        setLastResult(result);
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Analysis failed";
        setError(msg);
        throw e;
      } finally {
        setAnalyzing(false);
      }
    },
    []
  );

  return {
    progress,
    status: progress.status,
    statusMessage: progress.message,
    analyzing,
    error,
    lastResult,
    ensureReady,
    analyze,
    isReady: progress.status === "ready",
    isLoadingModel: progress.status === "loading" && !analyzing,
  };
}
