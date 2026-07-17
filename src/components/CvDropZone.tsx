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
        "relative cursor-pointer rounded-2xl border-2 border-dashed text-center transition-all",
        compact ? "p-8 md:p-10" : "p-10 md:p-14",
        "bg-white/50 backdrop-blur-sm dark:bg-white/[0.03]",
        dragging
          ? "border-indigo-500 bg-indigo-50/80 scale-[1.01] shadow-lg"
          : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-600",
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
        className={cn(
          "mx-auto mb-4 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30",
          compact ? "h-12 w-12" : "h-14 w-14"
        )}
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <FileUp className={compact ? "h-6 w-6" : "h-7 w-7"} />
        )}
      </div>

      <p
        className={cn(
          "font-bold tracking-tight text-star-white",
          compact ? "text-lg" : "text-xl"
        )}
      >
        {loading ? "Kariyer asistanı hazırlanıyor…" : "PDF / TXT dosyanı buraya sürükle"}
      </p>
      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
        {loading
          ? "Metin çıkarılıyor, lütfen bekleyin."
          : "veya tıklayarak dosya seç. İlk analizinle kariyerini güçlendir."}
      </p>

      {!loading && (
        <span className="mt-5 inline-flex h-11 items-center rounded-full bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg">
          Dosya seç
        </span>
      )}

      <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
        <Lock className="w-3.5 h-3.5" />
        Verileriniz cihazınızda kalır · sunucuya gitmez
      </p>
    </div>
  );
}

export default CvDropZone;
