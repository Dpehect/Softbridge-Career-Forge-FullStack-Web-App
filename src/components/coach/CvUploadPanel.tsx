"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, ClipboardPaste, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCareerStore } from "@/store/useCareerStore";
import { parseCV } from "@/lib/forge/parse";
import { extractTextFromFile } from "@/lib/forge/extractFileText";
import { parsedToResume } from "@/store/useCareerStore";
import { cn } from "@/lib/utils";

interface CvUploadPanelProps {
  lang: "tr" | "en";
  onAnalyzed?: () => void;
}

export function CvUploadPanel({ lang, onAnalyzed }: CvUploadPanelProps) {
  const { setForgeCvText, setForgeParsedCv, forgeCvText, forgeParsedCv, setResume } =
    useCareerStore();

  const [mode, setMode] = useState<"idle" | "paste" | "upload">("idle");
  const [pasteText, setPasteText] = useState(forgeCvText || "");
  const [extracting, setExtracting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isAnalyzed = Boolean(forgeParsedCv);
  const isTR = lang === "tr";

  async function analyzeText(raw: string) {
    if (!raw.trim()) return;
    setAnalyzing(true);
    setError(null);
    // small delay so spinner is visible
    await new Promise((r) => setTimeout(r, 600));
    try {
      const parsed = parseCV(raw);
      setForgeCvText(raw);
      setForgeParsedCv(parsed);
      setResume(parsedToResume(parsed));
      onAnalyzed?.();
    } catch {
      setError(
        isTR
          ? "CV metni analiz edilemedi. Lütfen farklı bir format deneyin."
          : "Could not parse the CV text. Try a different format."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleFile(file: File) {
    setExtracting(true);
    setError(null);
    setFileName(file.name);
    try {
      const { text } = await extractTextFromFile(file);
      setPasteText(text);
      setMode("paste");
    } catch {
      setError(
        isTR
          ? "Dosya okunamadı. PDF veya TXT formatı deneyin."
          : "Could not read the file. Try PDF or TXT format."
      );
    } finally {
      setExtracting(false);
    }
  }

  function clearAll() {
    setPasteText("");
    setFileName(null);
    setError(null);
    setMode("idle");
    setForgeCvText("");
    setForgeParsedCv(null);
  }

  // ── Already analyzed — show compact status bar ──────────────────────────
  if (isAnalyzed) {
    const cv = forgeParsedCv!;
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-4 flex items-center gap-4 border border-emerald-500/20"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-star-white truncate">
            {cv.name && cv.name !== "Candidate" && cv.name !== "Aday"
              ? cv.name
              : isTR ? "CV Yüklendi" : "CV Loaded"}
          </p>
          <p className="text-xs text-muted-steel mt-0.5">
            {isTR
              ? `${cv.experience.length} deneyim · ${cv.skills.length} beceri · ${cv.education.length} eğitim`
              : `${cv.experience.length} experiences · ${cv.skills.length} skills · ${cv.education.length} education`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-muted-steel hover:text-red-400 shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  // ── Upload / Paste UI ────────────────────────────────────────────────────
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-cosmic-teal/10">
      {/* Header */}
      <div className="p-4 border-b border-black/10">
        <p className="text-sm font-semibold text-star-white">
          {isTR ? "CV'ni Yükle veya Yapıştır" : "Upload or Paste Your CV"}
        </p>
        <p className="text-xs text-muted-steel mt-0.5">
          {isTR
            ? "CV'ini analiz ettikten sonra kişiselleştirilmiş sorular oluşturulur."
            : "After analysis, personalized coaching questions will be generated."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 grid grid-cols-2 gap-3"
          >
            {/* Paste */}
            <button
              onClick={() => setMode("paste")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-cosmic-teal/30 hover:border-cosmic-teal/60 hover:bg-cosmic-teal/5 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-cosmic-teal/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ClipboardPaste className="w-5 h-5 text-cosmic-teal" />
              </div>
              <span className="text-xs font-medium text-star-white text-center leading-tight">
                {isTR ? "Metin Yapıştır" : "Paste Text"}
              </span>
            </button>

            {/* Upload */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={extracting}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-cosmic-teal/30 hover:border-cosmic-teal/60 hover:bg-cosmic-teal/5 transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-cosmic-teal/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                {extracting ? (
                  <Loader2 className="w-5 h-5 text-cosmic-teal animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-cosmic-teal" />
                )}
              </div>
              <span className="text-xs font-medium text-star-white text-center leading-tight">
                {extracting
                  ? (isTR ? "Okunuyor..." : "Reading...")
                  : (isTR ? "PDF / TXT Yükle" : "Upload PDF / TXT")}
              </span>
            </button>

            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
          </motion.div>
        )}

        {mode === "paste" && (
          <motion.div
            key="paste"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 space-y-3"
          >
            {fileName && (
              <div className="flex items-center gap-2 text-xs text-cosmic-teal">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate">{fileName}</span>
              </div>
            )}
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={
                isTR
                  ? "CV metnini buraya yapıştırın…"
                  : "Paste your CV text here…"
              }
              className="min-h-[160px] max-h-[240px] resize-none text-sm text-star-white bg-black/10"
            />

            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> {error}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setMode("idle"); setPasteText(""); setFileName(null); }}
                className="text-muted-steel"
              >
                {isTR ? "Geri" : "Back"}
              </Button>
              <Button
                variant="accent"
                size="sm"
                className="flex-1"
                disabled={!pasteText.trim() || analyzing}
                onClick={() => void analyzeText(pasteText)}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    {isTR ? "Analiz ediliyor..." : "Analyzing..."}
                  </>
                ) : (
                  isTR ? "CV'yi Analiz Et ✨" : "Analyze CV ✨"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
