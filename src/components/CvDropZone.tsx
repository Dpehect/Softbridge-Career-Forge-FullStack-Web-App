"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  cleanExtractedText,
  extractTextFromFile,
  looksLikeRawPdf,
  parseCV,
  type ParsedCV,
} from "@/lib/forge";
import { useCareerStore } from "@/store/useCareerStore";

type Props = {
  className?: string;
  /** null = sayfada kal; string = yönlendir */
  redirectTo?: string | null;
  onParsed?: (parsed: ParsedCV, text: string, fileName: string) => void;
  /** Daha kompakt varyant (panel içi) */
  compact?: boolean;
};

/**
 * Sürükle-bırak CV yükleme — 100% tarayıcıda, sunucuya gitmez.
 */
export function CvDropZone({
  className,
  redirectTo = "/resume?from=analiz",
  onParsed,
  compact = false,
}: Props) {
  const router = useRouter();
  const {
    setForgeCvText,
    setForgeParsedCv,
    pushForgeHistory,
    setLastAnalysisMeta,
  } = useCareerStore();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setLoading(true);
      try {
        const { text } = await extractTextFromFile(file);
        const cleaned = cleanExtractedText(text);
        if (!cleaned.trim() || looksLikeRawPdf(cleaned) || looksLikeRawPdf(text)) {
          toast.error(
            "Bu PDF taranmış veya okunamıyor. Metin içeren PDF/TXT deneyin."
          );
          return;
        }
        const parsed = parseCV(cleaned);
        setForgeCvText(cleaned);
        setForgeParsedCv(parsed);
        pushForgeHistory({
          action: "parse",
          summary: `${parsed.name} — ${parsed.skills.length} beceri`,
          payload: parsed,
        });
        setLastAnalysisMeta({
          at: new Date().toISOString(),
          fileName: file.name,
          candidateName: parsed.name,
          targetTitle: parsed.title,
        });
        onParsed?.(parsed, cleaned, file.name);
        toast.success("CV yüklendi. Analiz için hazırsınız.");
        if (redirectTo) router.push(redirectTo);
      } catch (err) {
        const code = err instanceof Error ? err.message : "";
        if (code === "PDF_SCANNED" || code === "PDF_NO_TEXT") {
          toast.error("Taranmış PDF desteklenmiyor. Metin içeren PDF veya TXT kullanın.");
        } else if (code === "UNSUPPORTED") {
          toast.error("Desteklenen formatlar: PDF ve TXT.");
        } else {
          toast.error(
            "Dosya okunamadı. Bağlantını kontrol et veya başka bir dosya dene."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [
      redirectTo,
      router,
      setForgeCvText,
      setForgeParsedCv,
      pushForgeHistory,
      setLastAnalysisMeta,
      onParsed,
    ]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          document.getElementById("cv-drop-input-main")?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void processFile(file);
      }}
      onClick={() => document.getElementById("cv-drop-input-main")?.click()}
      className={cn(
        "relative flex flex-col items-center gap-4 cursor-pointer rounded-2xl border-2 border-dashed text-center transition-all",
        compact ? "p-10 md:p-12" : "p-12 md:p-16",
        "bg-white/60 backdrop-blur-sm dark:bg-white/[0.03]",
        dragging
          ? "border-purple-500 bg-purple-50/90 scale-[1.01] shadow-lg"
          : "border-slate-300 hover:border-purple-400 hover:bg-purple-50/50 dark:border-slate-600",
        loading && "pointer-events-none opacity-70",
        className
      )}
    >
      <input
        id="cv-drop-input-main"
        type="file"
        accept=".pdf,.txt,.md,application/pdf,text/plain"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void processFile(file);
        }}
      />

      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg, #6B21A8, #A855F7)",
          boxShadow: "0 4px 12px rgba(107, 33, 168, 0.25)",
        }}
      >
        {loading ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : (
          <FileUp className="h-7 w-7" />
        )}
      </div>

      <p className="font-bold tracking-tight text-lg md:text-xl text-slate-900 dark:text-white">
        {loading ? "Kariyer asistanı hazırlanıyor…" : "PDF/TXT dosyanı buraya sürükle"}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
        {loading
          ? "Metin çıkarılıyor, lütfen bekleyin."
          : "veya tıklayarak dosya seç. Verileriniz cihazınızda kalır."}
      </p>

      {!loading && (
        <span
          className="inline-flex h-11 items-center rounded-full px-6 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #6B21A8, #F97316)",
            boxShadow: "0 4px 12px rgba(107, 33, 168, 0.3)",
          }}
        >
          Yükle
        </span>
      )}

      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
        <Lock className="w-3.5 h-3.5" />
        🔐 %100 yerel işleme · sunucuya gönderilmez
      </p>

    </div>
  );
}

export default CvDropZone;
