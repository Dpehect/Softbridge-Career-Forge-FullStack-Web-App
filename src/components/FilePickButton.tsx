"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { extractTextFromFile } from "@/lib/forge/extractFileText";

type Props = {
  label?: string;
  accept?: string;
  onText: (text: string, fileName: string, meta: { kind: "text" | "pdf" }) => void;
  silentSuccess?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "accent" | "outline" | "ghost" | "soft" | "primary" | "ghostBorder";
};

/**
 * Click-only OS file dialog (browse folders by clicking). PDF/TXT supported.
 * Never passes raw PDF binary garbage to the parent.
 */
export function FilePickButton({
  label = "Choose file",
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
      setFileName(file.name);
      onText(text, file.name, { kind });
      if (!silentSuccess) {
        toast.success(`${file.name} yüklendi.`);
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "PDF_SCANNED" || code === "PDF_NO_TEXT") {
        toast.error(
          "Bu PDF taranmış görünüyor. Aranabilir metin olarak dışa aktarın veya yapıştırın."
        );
      } else if (code === "UNSUPPORTED") {
        toast.error("Desteklenen formatlar: PDF ve TXT.");
      } else if (code === "EMPTY") {
        toast.error("Dosya boş görünüyor.");
      } else {
        toast.error("Dosya okunamadı. Tekrar deneyin.");
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
        tabIndex={-1}
        aria-hidden="true"
        onChange={onChange}
      />
      <Button type="button" size={size} variant={variant} onClick={openPicker} disabled={loading} className={cn(loading && "opacity-50")}>
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
