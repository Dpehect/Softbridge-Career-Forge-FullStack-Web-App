"use server";

import {
  ATS_SYSTEM_PROMPT,
  analyzeWithOllama,
  checkOllamaServer,
  LOCAL_AI_UNAVAILABLE,
  OLLAMA_MODEL,
  parseOllamaJson,
} from "@/lib/ollama";

export type AtsAnalysis = {
  atsScore: number;
  missingKeywords: string[];
  feedback: string;
};

export type AnalyzeResult =
  | { ok: true; analysis: AtsAnalysis; model: string }
  | { ok: false; error: string; offline?: boolean };

/** Always resolves — safe for Header status pill on Vercel. */
export async function getAiEngineStatus() {
  try {
    return await checkOllamaServer();
  } catch {
    return {
      online: false as const,
      baseUrl: "(error)",
      model: OLLAMA_MODEL,
      latencyMs: null,
      models: [] as string[],
      error: LOCAL_AI_UNAVAILABLE,
      skipped: true,
    };
  }
}

function normalize(raw: Partial<AtsAnalysis>): AtsAnalysis {
  const n = Number(raw.atsScore);
  return {
    atsScore: Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 0,
    missingKeywords: Array.isArray(raw.missingKeywords)
      ? raw.missingKeywords.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 15)
      : [],
    feedback:
      typeof raw.feedback === "string" && raw.feedback.trim()
        ? raw.feedback.trim()
        : "No feedback generated.",
  };
}

export async function analyzeCvOffline(formData: FormData): Promise<AnalyzeResult> {
  try {
    const cvText = String(formData.get("cvText") ?? "").trim();
    const jobDescription = String(formData.get("jobDescription") ?? "").trim();

    if (cvText.length < 40) {
      return { ok: false, error: "CV text is too short for analysis." };
    }

    const status = await checkOllamaServer();
    if (!status.online) {
      return {
        ok: false,
        offline: true,
        error: LOCAL_AI_UNAVAILABLE,
      };
    }

    const prompt = [
      "TASK: ATS analysis. JSON only.",
      "",
      "=== JOB DESCRIPTION ===",
      jobDescription.replace(/\s+/g, " ").trim().slice(0, 4000) || "(none)",
      "",
      "=== CV TEXT ===",
      cvText.replace(/\s+/g, " ").trim().slice(0, 10000),
    ].join("\n");

    const result = await analyzeWithOllama(prompt, {
      model: OLLAMA_MODEL,
      system: ATS_SYSTEM_PROMPT,
      temperature: 0.2,
    });

    if (!result.ok) {
      return { ok: false, offline: true, error: result.error || LOCAL_AI_UNAVAILABLE };
    }

    try {
      const parsed = parseOllamaJson<Partial<AtsAnalysis>>(result.response);
      return { ok: true, analysis: normalize(parsed), model: result.model };
    } catch {
      return {
        ok: false,
        error: "AI returned unreadable data. Try again or use browser analysis.",
      };
    }
  } catch {
    return { ok: false, offline: true, error: LOCAL_AI_UNAVAILABLE };
  }
}
