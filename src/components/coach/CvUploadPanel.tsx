"use client";

import { useState } from "react";
import { Check, FileText, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FilePickButton } from "@/components/FilePickButton";
import { useCareerStore, parsedToResume } from "@/store/useCareerStore";
import { cleanExtractedText, parseCV } from "@/lib/forge";

interface CvUploadPanelProps {
  lang: "tr" | "en";
  onAnalyzed?: () => void;
}

export function CvUploadPanel({ lang, onAnalyzed }: CvUploadPanelProps) {
  const { forgeCvText, forgeParsedCv, setForgeCvText, setForgeParsedCv, setResume } = useCareerStore();
  const [showPaste, setShowPaste] = useState(false);
  const [text, setText] = useState(forgeCvText);
  const [loading, setLoading] = useState(false);
  const isTR = lang === "tr";

  const analyze = async (raw: string, fileName?: string) => {
    const cleaned = cleanExtractedText(raw);
    if (!cleaned.trim()) return;
    setLoading(true);
    try {
      const parsed = parseCV(cleaned);
      setForgeCvText(cleaned);
      setForgeParsedCv(parsed);
      setResume(parsedToResume(parsed));
      setText(cleaned);
      setShowPaste(false);
      onAnalyzed?.();
      toast.success(fileName ? `${fileName} koç bağlamına eklendi.` : "Özgeçmiş koç bağlamına eklendi.");
    } catch {
      toast.error(isTR ? "Özgeçmiş metni çözümlenemedi." : "The resume could not be parsed.");
    } finally {
      setLoading(false);
    }
  };

  if (forgeParsedCv && !showPaste) {
    return (
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--positive-wash)] text-positive"><Check className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-ink">{forgeParsedCv.name || "Özgeçmiş"}</p>
          <p className="mt-0.5 text-[0.6875rem] text-ink-3">{forgeParsedCv.skills.length} beceri · {forgeParsedCv.experience.length} deneyim</p>
        </div>
        <button type="button" onClick={() => setShowPaste(true)} className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] text-ink-3 hover:bg-surface-2 hover:text-ink" aria-label="Özgeçmişi değiştir" title="Değiştir">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-ink">Koç bağlamı</p>
          <p className="mt-1 text-[0.6875rem] leading-5 text-ink-3">Kişisel öneriler için özgeçmiş ekleyin.</p>
        </div>
        <FileText className="h-4 w-4 text-ink-3" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <FilePickButton label="PDF / TXT" size="sm" variant="outline" silentSuccess onText={(raw, fileName) => void analyze(raw, fileName)} />
        <Button size="sm" variant="ghost" onClick={() => setShowPaste((value) => !value)}>Metin yapıştır</Button>
      </div>
      {showPaste && (
        <div className="mt-4">
          <Textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Özgeçmiş metni" className="min-h-32 text-xs" />
          <Button variant="primary" size="sm" className="mt-2 w-full" disabled={!text.trim() || loading} onClick={() => void analyze(text)}>
            {loading ? "Çözümleniyor…" : "Koç bağlamına ekle"}
          </Button>
        </div>
      )}
    </div>
  );
}
