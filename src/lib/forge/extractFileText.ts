/**
 * Extract readable text from user-selected files without external packages.
 * Supports plain text and best-effort PDF (text-based PDFs).
 */

function decodePdfEscapes(s: string) {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

/** Best-effort text pull from PDF binary (no pdf.js). */
export function extractTextFromPdfBytes(bytes: Uint8Array): string {
  // Latin-1 map keeps byte values so binary regex still works
  let raw = "";
  const chunk = 0x2000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, Math.min(i + chunk, bytes.length));
    let part = "";
    for (let j = 0; j < slice.length; j++) part += String.fromCharCode(slice[j]!);
    raw += part;
  }

  const parts: string[] = [];

  // Parenthesized strings used by Tj / ' operators
  const parenRe = /\((?:\\.|[^\\()])*\)\s*Tj/g;
  let m: RegExpExecArray | null;
  while ((m = parenRe.exec(raw))) {
    const inner = m[0].slice(1, m[0].lastIndexOf(")"));
    const decoded = decodePdfEscapes(inner).trim();
    if (decoded.length > 0) parts.push(decoded);
  }

  // TJ arrays: [(Hello) -10 (World)] TJ
  const tjArrayRe = /\[([\s\S]*?)\]\s*TJ/g;
  while ((m = tjArrayRe.exec(raw))) {
    const body = m[1];
    const strRe = /\((?:\\.|[^\\()])*\)/g;
    let sm: RegExpExecArray | null;
    let line = "";
    while ((sm = strRe.exec(body))) {
      line += decodePdfEscapes(sm[0].slice(1, -1));
    }
    if (line.trim()) parts.push(line.trim());
  }

  // Hex strings <0048...> sometimes used
  const hexRe = /<([0-9A-Fa-f\s]+)>\s*Tj/g;
  while ((m = hexRe.exec(raw))) {
    const hex = m[1].replace(/\s/g, "");
    if (hex.length % 2 !== 0) continue;
    let s = "";
    for (let i = 0; i < hex.length; i += 2) {
      const code = parseInt(hex.slice(i, i + 2), 16);
      if (code >= 32 && code < 127) s += String.fromCharCode(code);
      else if (code === 0) s += " ";
    }
    if (s.trim()) parts.push(s.trim());
  }

  let text = parts.join("\n");

  // Fallback: pull long runs of printable ASCII from streams
  if (text.replace(/\s/g, "").length < 40) {
    const runs = raw.match(/[\x20-\x7E\u00C0-\u024F]{5,}/g) ?? [];
    text = runs
      .filter((r) => !/^(endstream|endobj|startxref|xref|trailer)/i.test(r))
      .join("\n");
  }

  // Collapse noise
  text = text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

export async function extractTextFromFile(file: File): Promise<{ text: string; kind: "text" | "pdf" }> {
  const name = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";

  if (isPdf) {
    const buf = await file.arrayBuffer();
    const text = extractTextFromPdfBytes(new Uint8Array(buf));
    return { text, kind: "pdf" };
  }

  const isTextLike =
    file.type.startsWith("text/") ||
    file.type === "application/json" ||
    file.type === "application/rtf" ||
    /\.(txt|md|markdown|csv|json|log|rtf)$/i.test(file.name) ||
    file.type === "";

  if (!isTextLike) {
    throw new Error("UNSUPPORTED");
  }

  const text = await file.text();
  return { text, kind: "text" };
}
