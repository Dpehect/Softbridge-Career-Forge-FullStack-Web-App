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
  variant?: "default" | "accent" | "outline" | "ghost" | "soft";
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
        toast.success(`${file.name} loaded with clean text`);
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "PDF_SCANNED") {
        toast.error(
          "This PDF appears to be a scanned document. Please export it as searchable text or paste the content manually."
        );
      } else if (code === "PDF_NO_TEXT") {
        toast.error(
          "Could not extract text from this PDF. Try another export, use TXT, or paste the content manually."
        );
      } else if (code === "UNSUPPORTED") {
        toast.error("Supported formats: PDF and TXT (also MD).");
      } else if (code === "EMPTY") {
        toast.error("File looks empty.");
      } else {
        toast.error("Could not read the file.");
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
        {loading ? "Reading…" : label}
      </Button>
      {fileName && (
        <span className="text-[11px] text-muted-steel max-w-[140px] truncate" title={fileName}>
          {fileName}
        </span>
      )}
    </div>
  );
}
