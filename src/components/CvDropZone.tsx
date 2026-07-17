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
} from "@/lib/forge";
import { useCareerStore } from "@/store/useCareerStore";

type Props = {
  className?: string;
  /** After success go to resume editor (golden path) */
  redirectTo?: string;
};

/**
 * Primary PLG entry: drag & drop CV → parse → resume editor.
 */
export function CvDropZone({ className, redirectTo = "/resume?from=analiz" }: Props) {
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
            "Bu PDF taranmış veya okunamıyor görünüyor. Lütfen metin olarak dışa aktarın veya yapıştırın."
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
        toast.success("CV yüklendi. Sizi düzenleyiciye alıyoruz — hataları birlikte kapatacağız.");
        router.push(redirectTo);
      } catch (err) {
        const code = err instanceof Error ? err.message : "";
        if (code === "PDF_SCANNED" || code === "PDF_NO_TEXT") {
          toast.error("Taranmış PDF desteklenmiyor. Metin içeren PDF veya TXT deneyin.");
        } else if (code === "UNSUPPORTED") {
          toast.error("Desteklenen formatlar: PDF ve TXT.");
        } else {
          toast.error(
            "Dosya okunamadı. Yerel AI / PDF ayrıştırıcı yanıt vermiyor olabilir — tekrar deneyin."
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
    ]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          document.getElementById("cv-drop-input")?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => document.getElementById("cv-drop-input")?.click()}
      className={cn(
        "relative cursor-pointer rounded-3xl border-2 border-dashed p-8 md:p-12 text-center transition-all",
        "bg-white/60 backdrop-blur-sm shadow-sm dark:bg-white/5",
        dragging
          ? "border-indigo-500 bg-indigo-50/80 scale-[1.01]"
          : "border-indigo-300/70 hover:border-indigo-500 hover:bg-indigo-50/40",
        loading && "pointer-events-none opacity-70",
        className
      )}
    >
      <input
        id="cv-drop-input"
        type="file"
        accept=".pdf,.txt,.md,application/pdf,text/plain"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void processFile(file);
        }}
      />

      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
        {loading ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : (
          <FileUp className="h-7 w-7" />
        )}
      </div>

      <p className="font-extrabold tracking-tighter text-xl text-star-white">
        {loading ? "CV okunuyor…" : "CV’nizi buraya sürükleyin"}
      </p>
      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
        {loading
          ? "Metin çıkarılıyor ve yapılandırılıyor — lütfen bekleyin."
          : "veya tıklayarak PDF / TXT seçin. Analiz bitince sizi Özgeçmiş Düzenleyici’ye alacağız."}
      </p>

      {!loading && (
        <span className="mt-5 inline-flex h-11 items-center rounded-2xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-lg">
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
