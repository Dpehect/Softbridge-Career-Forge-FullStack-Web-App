/**
 * CareerForge — 100% browser AI (Transformers.js).
 * No backend, no API keys, no Ollama.
 *
 * Model: Xenova/all-MiniLM-L6-v2 (quantized embeddings)
 * First call downloads weights once; then cached in IndexedDB/browser cache.
 */

export type ClientAiStatus = "idle" | "loading" | "ready" | "error";

export type SemanticMatchResult = {
  matchScore: number;
  atsScore: number;
  similarity: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  summary: string;
};

export type ClientAiProgress = {
  status: ClientAiStatus;
  message: string;
  progress?: number;
};

type FeaturePipeline = (
  text: string,
  opts?: { pooling?: string; normalize?: boolean }
) => Promise<{ data: Float32Array | number[] }>;

let extractor: FeaturePipeline | null = null;
let loadPromise: Promise<FeaturePipeline> | null = null;
let status: ClientAiStatus = "idle";
let lastError: string | null = null;

const listeners = new Set<(p: ClientAiProgress) => void>();

function emit(partial: Partial<ClientAiProgress> & { status: ClientAiStatus; message: string }) {
  status = partial.status;
  const payload: ClientAiProgress = {
    status: partial.status,
    message: partial.message,
    progress: partial.progress,
  };
  listeners.forEach((fn) => fn(payload));
}

export function subscribeClientAi(fn: (p: ClientAiProgress) => void): () => void {
  listeners.add(fn);
  fn({
    status,
    message:
      status === "ready"
        ? "Kariyer asistanı hazır"
        : status === "loading"
          ? "Kariyer Asistanı Hazırlanıyor…"
          : status === "error"
            ? lastError || "Analiz şu an yapılamıyor"
            : "Kariyer asistanı",
  });
  return () => {
    listeners.delete(fn);
  };
}

export function getClientAiStatus(): ClientAiStatus {
  return status;
}

/** Cosine similarity of two vectors */
export function cosineSimilarity(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    const x = Number(a[i] ?? 0);
    const y = Number(b[i] ?? 0);
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Lazy-load embedding pipeline in the browser only.
 */
export async function loadBrowserAi(): Promise<FeaturePipeline> {
  if (typeof window === "undefined") {
    throw new Error("Browser AI only runs in the client.");
  }
  if (extractor) return extractor;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      emit({
        status: "loading",
        message: "Kariyer Asistanı Hazırlanıyor… (ilk seferde model indirilir)",
        progress: 0.1,
      });

      const { pipeline, env } = await import("@xenova/transformers");

      // Prefer browser cache; no local server models
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      emit({
        status: "loading",
        message: "Kariyer Asistanı Hazırlanıyor… embedding modeli yükleniyor",
        progress: 0.4,
      });

      const pipe = (await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
        // quantized keeps first download small enough for SaaS UX
        { quantized: true }
      )) as FeaturePipeline;

      extractor = pipe;
      emit({ status: "ready", message: "Kariyer asistanı hazır", progress: 1 });
      return pipe;
    } catch (err) {
      lastError =
        err instanceof Error
          ? "Analiz şu an yapılamıyor, bağlantını kontrol et ve sayfayı yenile."
          : "Analiz şu an yapılamıyor.";
      emit({ status: "error", message: lastError });
      loadPromise = null;
      throw err;
    }
  })();

  return loadPromise;
}

export async function embedText(text: string): Promise<Float32Array> {
  const pipe = await loadBrowserAi();
  const cleaned = text.replace(/\s+/g, " ").trim().slice(0, 8000) || "empty";
  const out = await pipe(cleaned, { pooling: "mean", normalize: true });
  const data = out.data;
  return data instanceof Float32Array ? data : Float32Array.from(data as number[]);
}

const STOP = new Set(
  "the a an and or for with to of in on at is are was be this that from by as your you we our their will can may must should about into over under more most other such than then them these those".split(
    " "
  )
);

export function extractKeywords(text: string, limit = 20): string[] {
  const counts = new Map<string, number>();
  const tokens = text.toLowerCase().match(/[a-z][a-z0-9.+#-]{1,24}/g) ?? [];
  for (const t of tokens) {
    if (t.length < 3 || STOP.has(t)) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

/**
 * Full client-side CV vs JD analysis (embeddings + keyword gap).
 * No network except first-time model download from HuggingFace CDN.
 */
export async function analyzeCvJobInBrowser(
  cvText: string,
  jobDescription: string,
  skills: string[] = []
): Promise<SemanticMatchResult> {
  emit({ status: "loading", message: "Analiz ediliyor…", progress: 0.5 });

  const cv = cvText.replace(/\s+/g, " ").trim();
  const jd = jobDescription.replace(/\s+/g, " ").trim();

  if (cv.length < 20) {
    throw new Error("CV text is too short for analysis.");
  }

  const [cvEmb, jdEmb] = await Promise.all([
    embedText(cv || "candidate"),
    embedText(jd || cv || "role"),
  ]);

  const similarity = Math.max(0, Math.min(1, cosineSimilarity(cvEmb, jdEmb)));
  const matchScore = Math.round(similarity * 100);

  const jdKeys = extractKeywords(jd || cv, 24);
  const cvLower = cv.toLowerCase();
  const skillLower = skills.map((s) => s.toLowerCase());

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const k of jdKeys) {
    if (cvLower.includes(k) || skillLower.some((s) => s.includes(k) || k.includes(s))) {
      matchedKeywords.push(k);
    } else {
      missingKeywords.push(k);
    }
  }

  // ATS blends embedding fit + keyword coverage
  const coverage =
    jdKeys.length === 0 ? 0.55 : matchedKeywords.length / Math.max(1, jdKeys.length);
  const atsScore = Math.round(
    Math.min(98, Math.max(18, matchScore * 0.55 + coverage * 100 * 0.45))
  );

  const strengths: string[] = [];
  const gaps: string[] = [];
  const suggestions: string[] = [];

  if (matchScore >= 70) {
    strengths.push(`Bu rol tanımı için anlamsal eşleşme oldukça güçlü (%${matchScore}).`);
  } else if (matchScore >= 45) {
    strengths.push(`Kısmi anlamsal eşleşme (%${matchScore}) — eksik anahtar kelimeleri tamamlayarak skoru artırabilirsiniz.`);
  } else {
    gaps.push(`Düşük anlamsal eşleşme (%${matchScore}) — özet bölümünü ve deneyim kurşun noktalarını iş tanımındaki dile göre yeniden yazın.`);
  }

  if (matchedKeywords.length) {
    strengths.push(
      `Eşleşen sinyaller: ${matchedKeywords.slice(0, 6).join(", ")}${matchedKeywords.length > 6 ? "..." : ""}.`
    );
  }
  if (missingKeywords.length) {
    gaps.push(
      `Eksik yüksek değerli terimler: ${missingKeywords.slice(0, 8).join(", ")}.`
    );
    suggestions.push(
      `Bu terimleri (doğruysa) beceriler veya deneyimlerinize ekleyin: ${missingKeywords.slice(0, 5).join(", ")}.`
    );
  }
  suggestions.push(
    "3 deneyim maddesini şu şekilde yeniden yazın: eylem fiili + kullanılan teknoloji + iş tanımıyla uyumlu ölçülebilir sonuç."
  );
  suggestions.push(
    "Özet kısmında iş ilanındaki anahtar ifadeleri birebir yansıtmaya çalışın (deneyim uydurmadan)."
  );

  const summary = `Tarayıcı AI eşleşmesi %${matchScore} · ATS %${atsScore} · ${missingKeywords.length} eksik anahtar kelime. %100 cihaz üzerinde çalışır — sunucu bağımsızdır.`;

  emit({ status: "ready", message: "Analiz tamamlandı", progress: 1 });

  return {
    matchScore,
    atsScore,
    similarity,
    missingKeywords: missingKeywords.slice(0, 12),
    matchedKeywords: matchedKeywords.slice(0, 12),
    strengths,
    gaps,
    suggestions,
    summary,
  };
}

/** Warm the model early (e.g. on Forge mount) */
export function preloadBrowserAi() {
  if (typeof window === "undefined") return;
  void loadBrowserAi().catch(() => {
    /* status already emitted */
  });
}
