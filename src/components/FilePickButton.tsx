"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { extractTextFromFile } from "@/lib/forge/extractFileText";

type Props = {
  label?: string;
  /** Default: text + PDF, click-to-browse OS picker */
  accept?: string;
  onText: (text: string, fileName: string, meta: { kind: "text" | "pdf" }) => void;
  /** If true, skip default success toast (caller shows its own). */
  silentSuccess?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "accent" | "outline" | "ghost" | "soft";
};

/**
 * Opens the OS file dialog on click (browse folders by clicking).
 * No drag-and-drop — click only. Supports TXT/MD and best-effort PDF text extract.
 */
export function FilePickButton({
  label = "Dosya seç",
  accept = ".txt,.md,.markdown,.csv,.json,.log,.rtf,.pdf,text/plain,application/pdf",
  onText,
  silentSuccess = false,
  className,
  size = "sm",
  variant = "outline",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setLoading(true);
    try {
      const { text, kind } = await extractTextFromFile(file);
      if (!text.trim()) {
        toast.error(
          kind === "pdf"
            ? "PDF’den metin çıkarılamadı (taranmış görüntü olabilir). Metni kopyalayıp yapıştır."
            : "Dosya boş görünüyor."
        );
        return;
      }
      if (kind === "pdf" && text.replace(/\s/g, "").length < 60) {
        toast.message("PDF metni zayıf çıktı; gerekirse elle düzeltip Parse et.");
      }
      setFileName(file.name);
      onText(text, file.name, { kind });
      if (!silentSuccess) {
        toast.success(`${file.name} yüklendi`);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "UNSUPPORTED") {
        toast.error("Desteklenen formatlar: PDF, TXT, MD.");
      } else {
        toast.error("Dosya okunamadı.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={onChange}
      />
      <Button type="button" size={size} variant={variant} onClick={openPicker} disabled={loading}>
        <FolderOpen className="w-4 h-4" />
        {loading ? "Okunuyor…" : label}
      </Button>
      {fileName && (
        <span className="text-[11px] text-muted-steel max-w-[140px] truncate" title={fileName}>
          {fileName}
        </span>
      )}
    </div>
  );
}
