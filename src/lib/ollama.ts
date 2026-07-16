/**
 * Local Ollama client — native fetch only (offline-ready).
 */

export const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") || "http://localhost:11434";

export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

export type OllamaStatus = {
  online: boolean;
  baseUrl: string;
  model: string;
  latencyMs: number | null;
  models: string[];
  error?: string;
};

export async function checkOllamaServer(timeoutMs = 2500): Promise<OllamaStatus> {
  const baseUrl = OLLAMA_BASE_URL;
  const model = OLLAMA_MODEL;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  console.log("[CareerForge/Ollama] Checking local engine…");
  console.log(`[CareerForge/Ollama] GET ${baseUrl}/api/tags`);

  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    const latencyMs = Date.now() - started;

    if (!res.ok) {
      console.error(`[CareerForge/Ollama] OFFLINE — HTTP ${res.status}`);
      console.error("[CareerForge/Ollama] Debug: run `ollama serve` then `curl http://localhost:11434/api/tags`");
      return {
        online: false,
        baseUrl,
        model,
        latencyMs,
        models: [],
        error: `HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as { models?: { name?: string }[] };
    const models = (data.models ?? []).map((m) => m.name || "").filter(Boolean);

    console.log(
      `[CareerForge/Ollama] ONLINE — ${latencyMs}ms — models: ${models.join(", ") || "(none)"}`
    );

    return { online: true, baseUrl, model, latencyMs, models };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[CareerForge/Ollama] OFFLINE —", message);
    console.error("[CareerForge/Ollama] Checklist: ollama serve · ollama list · curl localhost:11434/api/tags");
    return {
      online: false,
      baseUrl,
      model,
      latencyMs: Date.now() - started,
      models: [],
      error: message,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function analyzeWithOllama(
  prompt: string,
  options: { model?: string; system?: string; temperature?: number; timeoutMs?: number } = {}
): Promise<{ response: string; model: string }> {
  const model = options.model || OLLAMA_MODEL;
  const timeoutMs = options.timeoutMs ?? 120_000;
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
      const body = await res.text().catch(() => "");
      throw new Error(`Ollama generate failed (${res.status}): ${body.slice(0, 180)}`);
    }

    const data = (await res.json()) as { response?: string; model?: string };
    const response = (data.response ?? "").trim();
    if (!response) throw new Error("Ollama returned an empty response.");
    return { response, model: data.model || model };
  } finally {
    clearTimeout(timer);
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
