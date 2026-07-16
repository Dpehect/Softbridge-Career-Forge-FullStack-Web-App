"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TEXT_EXT = /\.(txt|md|markdown|csv|json|log|rtf)$/i;

type Props = {
  label?: string;
  accept?: string;
  onText: (text: string, fileName: string) => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "accent" | "outline" | "ghost" | "soft";
};

/**
 * Opens the OS file dialog on click (browse folders by clicking).
 * No drag-and-drop — click only.
 */
export function FilePickButton({
  label = "Dosya seç",
  accept = ".txt,.md,.markdown,.csv,.json,.log,.rtf,text/plain",
  onText,
  className,
  size = "sm",
  variant = "outline",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // allow re-selecting the same file later
    e.target.value = "";
    if (!file) return;

    const looksText =
      file.type.startsWith("text/") ||
      file.type === "application/json" ||
      file.type === "application/rtf" ||
      TEXT_EXT.test(file.name) ||
      file.type === "";

    if (!looksText) {
      toast.error("Bu format desteklenmiyor. .txt veya .md seç (PDF için metni kopyala).");
      return;
    }

    try {
      const text = await file.text();
      if (!text.trim()) {
        toast.error("Dosya boş görünüyor.");
        return;
      }
      setFileName(file.name);
      onText(text, file.name);
      toast.success(`${file.name} yüklendi`);
    } catch {
      toast.error("Dosya okunamadı.");
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        // no webkitdirectory — user navigates folders in the system picker by clicking
        onChange={onChange}
      />
      <Button type="button" size={size} variant={variant} onClick={openPicker}>
        <FolderOpen className="w-4 h-4" />
        {label}
      </Button>
      {fileName && (
        <span className="text-[11px] text-muted-steel max-w-[140px] truncate" title={fileName}>
          {fileName}
        </span>
      )}
    </div>
  );
}
