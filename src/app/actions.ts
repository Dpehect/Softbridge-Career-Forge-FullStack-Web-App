"use server";

import {
  ATS_SYSTEM_PROMPT,
  analyzeWithOllama,
  checkOllamaServer,
  OLLAMA_MODEL,
} from "@/lib/ollama";

export type AtsAnalysis = {
  atsScore: number;
  missingKeywords: string[];
  feedback: string;
};

export type AnalyzeResult =
  | { ok: true; analysis: AtsAnalysis; model: string }
  | { ok: false; error: string; offline?: boolean };

export async function getAiEngineStatus() {
  return checkOllamaServer();
}

function parseJsonLoose<T>(raw: string): T {
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
      error:
        "Kariyerinizi bekletmeyelim — yerel AI sunucumuz şu an yanıt vermiyor. Lütfen Ollama bağlantınızı kontrol edin.",
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

  try {
    const { response, model } = await analyzeWithOllama(prompt, {
      model: OLLAMA_MODEL,
      system: ATS_SYSTEM_PROMPT,
      temperature: 0.2,
    });
    const analysis = normalize(parseJsonLoose<Partial<AtsAnalysis>>(response));
    return { ok: true, analysis, model };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const offline = /fetch failed|ECONNREFUSED|timeout|offline|AbortError/i.test(message);
    return {
      ok: false,
      offline,
      error: offline
        ? "Kariyerinizi bekletmeyelim — yerel AI sunucumuz şu an yanıt vermiyor. Lütfen bağlantınızı kontrol edin."
        : `Analiz tamamlanamadı: ${message}`,
    };
  }
}
