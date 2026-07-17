/**
 * CareerForge — environment-safe Ollama client (native fetch only).
 * Never crashes the app when Ollama is missing or when deployed on Vercel.
 */

const isVercel =
  process.env.VERCEL === "1" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
  process.env.NODE_ENV === "production";

/** Explicit public URL only — never default to localhost on Vercel/production. */
export const OLLAMA_BASE_URL = (() => {
  const raw = process.env.OLLAMA_BASE_URL?.trim().replace(/\/$/, "") || "";
  if (raw) return raw;
  // Local dev convenience only
  if (!isVercel && process.env.NODE_ENV === "development") {
    return "http://localhost:11434";
  }
  return "";
})();

export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

export const LOCAL_AI_UNAVAILABLE = "Local AI unavailable";

export type OllamaStatus = {
  online: boolean;
  baseUrl: string;
  model: string;
  latencyMs: number | null;
  models: string[];
  error?: string;
  /** True when production has no Ollama endpoint configured */
  skipped?: boolean;
};

export function isLocalAiConfigured(): boolean {
  return Boolean(OLLAMA_BASE_URL);
}

/**
 * Probe Ollama. Always resolves — never throws.
 */
export async function checkOllamaServer(timeoutMs = 2000): Promise<OllamaStatus> {
  const model = OLLAMA_MODEL;

  if (!OLLAMA_BASE_URL) {
    return {
      online: false,
      baseUrl: "(not configured)",
      model,
      latencyMs: 0,
      models: [],
      skipped: true,
      error: LOCAL_AI_UNAVAILABLE,
    };
  }

  // Extra safety: never hit bare localhost from a known serverless host
  if (
    isVercel &&
    /localhost|127\.0\.0\.1/i.test(OLLAMA_BASE_URL)
  ) {
    return {
      online: false,
      baseUrl: OLLAMA_BASE_URL,
      model,
      latencyMs: 0,
      models: [],
      skipped: true,
      error: LOCAL_AI_UNAVAILABLE,
    };
  }

  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    const latencyMs = Date.now() - started;

    if (!res.ok) {
      return {
        online: false,
        baseUrl: OLLAMA_BASE_URL,
        model,
        latencyMs,
        models: [],
        error: LOCAL_AI_UNAVAILABLE,
      };
    }

    const data = (await res.json()) as { models?: { name?: string }[] };
    const models = (data.models ?? []).map((m) => m.name || "").filter(Boolean);

    return {
      online: true,
      baseUrl: OLLAMA_BASE_URL,
      model,
      latencyMs,
      models,
    };
  } catch {
    return {
      online: false,
      baseUrl: OLLAMA_BASE_URL,
      model,
      latencyMs: Date.now() - started,
      models: [],
      error: LOCAL_AI_UNAVAILABLE,
    };
  } finally {
    clearTimeout(timer);
  }
}

export type AnalyzeWithOllamaResult =
  | { ok: true; response: string; model: string }
  | { ok: false; error: string; offline: true };

/**
 * POST /api/generate. Never throws — returns { ok: false } when offline.
 */
export async function analyzeWithOllama(
  prompt: string,
  options: {
    model?: string;
    system?: string;
    temperature?: number;
    timeoutMs?: number;
  } = {}
): Promise<AnalyzeWithOllamaResult> {
  const model = options.model || OLLAMA_MODEL;
  const timeoutMs = options.timeoutMs ?? 60_000;

  try {
    const status = await checkOllamaServer(Math.min(timeoutMs, 2500));
    if (!status.online) {
      return { ok: false, error: LOCAL_AI_UNAVAILABLE, offline: true };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          model,
          prompt,
          system: options.system,
          stream: false,
          format: "json",
          options: { temperature: options.temperature ?? 0.2 },
        }),
      });

      if (!res.ok) {
        return { ok: false, error: LOCAL_AI_UNAVAILABLE, offline: true };
      }

      const data = (await res.json()) as { response?: string; model?: string };
      const response = (data.response ?? "").trim();
      if (!response) {
        return { ok: false, error: LOCAL_AI_UNAVAILABLE, offline: true };
      }

      return { ok: true, response, model: data.model || model };
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return { ok: false, error: LOCAL_AI_UNAVAILABLE, offline: true };
  }
}

export function parseOllamaJson<T>(raw: string): T {
  const t = raw.trim();
  try {
    return JSON.parse(t) as T;
  } catch {
    const a = t.indexOf("{");
    const b = t.lastIndexOf("}");
    if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1)) as T;
    throw new Error("Failed to parse Ollama JSON output.");
  }
}

export const ATS_SYSTEM_PROMPT = `
You are CareerForge — a senior ATS expert and career coach running fully offline.
Return ONE valid JSON object only. No markdown. No code fences.

Exact shape:
{
  "atsScore": 0,
  "missingKeywords": ["string"],
  "feedback": "string"
}

Rules:
- atsScore: integer 0-100
- missingKeywords: 5-12 concrete keywords/phrases
- feedback: 3-6 short actionable sentences
- Do not invent employers, tools, or metrics missing from the CV
`.trim();
