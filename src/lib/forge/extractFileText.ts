/**
 * Extract readable text from user files without external packages.
 * Plain text + best-effort PDF (only clean human text — never raw %PDF dumps).
 */

const PDF_NOISE =
  /^(obj|endobj|stream|endstream|xref|trailer|startxref|%%EOF|BT|ET|Tf|Tj|TJ|Td|TD|Tm|cm|re|f|S|q|Q|gs|Do|ID|EI)$/i;

const PDF_META_LINE =
  /(%PDF|\/Type|\/Font|\/Encoding|\/BaseFont|\/Subtype|\/Length|\/Filter|\/FlateDecode|\/Pages|\/Page|\/MediaBox|\/Parent|\/Kids|\/Count|\/Resources|\/Contents|\/ProcSet|\/ExtGState|\/XObject|endstream|endobj|startxref)/i;

function decodePdfEscapes(s: string) {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{3})/g, (_, oct) => {
      const code = parseInt(oct, 8);
      return code >= 32 && code < 127 ? String.fromCharCode(code) : " ";
    });
}

function bytesToBinaryString(bytes: Uint8Array): string {
  let raw = "";
  const chunk = 0x2000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, Math.min(i + chunk, bytes.length));
    let part = "";
    for (let j = 0; j < slice.length; j++) part += String.fromCharCode(slice[j]!);
    raw += part;
  }
  return raw;
}

/** Keep only strings that look like CV/resume language. */
export function isLikelyHumanText(s: string): boolean {
  const t = s.trim();
  if (t.length < 2 || t.length > 500) return false;
  if (PDF_NOISE.test(t)) return false;
  if (PDF_META_LINE.test(t)) return false;
  if (/^[\d\s.\-]+$/.test(t) && t.length < 4) return false;
  // too many non-printable / high binary
  let bad = 0;
  let letters = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    if (c < 9 || (c > 13 && c < 32) || c === 127) bad++;
    if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122) || (c >= 192 && c <= 591)) letters++;
    // Turkish letters handled loosely via unicode letters
    if (/\p{L}/u.test(t[i]!)) letters++;
  }
  if (bad / t.length > 0.08) return false;
  if (letters < 2) return false;
  // reject mostly symbol soup without vowels (often font/binary noise)
  if (t.length > 8 && !/[aeiouAEIOUıİöÖüÜşŞçÇğĞ]/.test(t) && !/@/.test(t)) {
    if (!/\d{4}/.test(t)) return false; // allow pure years
  }
  return true;
}

export function cleanExtractedText(text: string): string {
  let t = text
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  // Drop lines that are clearly PDF internals
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  const kept: string[] = [];
  for (const line of lines) {
    if (PDF_META_LINE.test(line)) continue;
    if (/^%PDF/.test(line)) continue;
    if (/^<<|>>$/.test(line)) continue;
    if (/^\/[A-Z][A-Za-z]+/.test(line) && line.split(" ").length < 4) continue;
    // strip leftover control glyphs
    const cleaned = line
      .replace(/[^\S\n]+/g, " ")
      .replace(/[^\p{L}\p{N}\p{P}\p{Zs}@+#/&%°'’\-–—()[\]{}:;,./\\|+*=<>€$£₺\n]/gu, "")
      .trim();
    if (!cleaned) continue;
    if (!isLikelyHumanText(cleaned) && cleaned.length < 80) {
      // still keep longer narrative lines that pass soft checks
      if (cleaned.length < 12) continue;
      if (PDF_META_LINE.test(cleaned)) continue;
    }
    kept.push(cleaned);
  }

  // Merge single-word fragments that often come from character-by-character PDFs
  const merged: string[] = [];
  let buf = "";
  for (const line of kept) {
    if (line.length <= 2 && /^[\p{L}\p{N}]$/u.test(line)) {
      buf += line;
      continue;
    }
    if (buf) {
      if (buf.length >= 2) merged.push(buf);
      buf = "";
    }
    merged.push(line);
  }
  if (buf.length >= 2) merged.push(buf);

  t = merged.join("\n");
  t = t.replace(/\n{3,}/g, "\n\n").trim();
  return t;
}

export function looksLikeRawPdf(text: string): boolean {
  const head = text.slice(0, 500);
  if (/%PDF-?\d/.test(head)) return true;
  if (/endobj|endstream|startxref|\/FlateDecode|\/Type\s*\/Page/.test(text.slice(0, 4000))) {
    // if also low human letter density → garbage
    const sample = text.slice(0, 2000);
    const letters = (sample.match(/\p{L}/gu) ?? []).length;
    if (letters / Math.max(sample.length, 1) < 0.35) return true;
  }
  return false;
}

function extractFromStreams(raw: string): string[] {
  const parts: string[] = [];
  // Prefer content inside stream...endstream blocks
  const streamRe = /stream\r?\n([\s\S]*?)endstream/g;
  let sm: RegExpExecArray | null;
  const chunks: string[] = [];
  while ((sm = streamRe.exec(raw))) {
    chunks.push(sm[1]);
  }
  const bodies = chunks.length ? chunks : [raw];

  for (const body of bodies) {
    // (Hello) Tj  or  (Hello) '
    const parenRe = /\(((?:\\.|[^\\()])*?)\)\s*(?:Tj|'|")/g;
    let m: RegExpExecArray | null;
    while ((m = parenRe.exec(body))) {
      const decoded = decodePdfEscapes(m[1]).trim();
      if (decoded && isLikelyHumanText(decoded)) parts.push(decoded);
    }

    // [(He) -10 (llo)] TJ
    const tjArrayRe = /\[([\s\S]*?)\]\s*TJ/g;
    while ((m = tjArrayRe.exec(body))) {
      const inner = m[1];
      const strRe = /\(((?:\\.|[^\\()])*?)\)/g;
      let sm2: RegExpExecArray | null;
      let line = "";
      while ((sm2 = strRe.exec(inner))) {
        line += decodePdfEscapes(sm2[1]);
      }
      line = line.replace(/\s+/g, " ").trim();
      if (line && isLikelyHumanText(line)) parts.push(line);
    }

    // Hex <00480065> Tj (simple ASCII/UTF-16BE-ish)
    const hexRe = /<([0-9A-Fa-f\s]+)>\s*Tj/g;
    while ((m = hexRe.exec(body))) {
      const hex = m[1].replace(/\s/g, "");
      if (hex.length < 4 || hex.length % 2 !== 0) continue;
      let s = "";
      // UTF-16BE if mostly 00xx pairs
      const pairs = hex.length / 2;
      let zeroHigh = 0;
      for (let i = 0; i < hex.length; i += 4) {
        if (hex.slice(i, i + 2) === "00") zeroHigh++;
      }
      if (pairs >= 2 && zeroHigh >= pairs / 4) {
        for (let i = 0; i + 3 < hex.length; i += 4) {
          const code = parseInt(hex.slice(i, i + 4), 16);
          if (code >= 32 && code < 0xd800) s += String.fromCharCode(code);
        }
      } else {
        for (let i = 0; i < hex.length; i += 2) {
          const code = parseInt(hex.slice(i, i + 2), 16);
          if (code >= 32 && code < 127) s += String.fromCharCode(code);
        }
      }
      s = s.trim();
      if (s && isLikelyHumanText(s)) parts.push(s);
    }
  }

  return parts;
}

/** Best-effort text pull from PDF binary — returns empty if only garbage. */
export function extractTextFromPdfBytes(bytes: Uint8Array): string {
  if (bytes.length < 5) return "";
  // magic check
  const magic = String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!, bytes[4]!);
  if (!magic.startsWith("%PDF")) {
    // might still be PDF without standard header offset — continue
  }

  const raw = bytesToBinaryString(bytes);
  const parts = extractFromStreams(raw);
  let text = parts.join("\n");
  text = cleanExtractedText(text);

  // If still too short, do NOT fall back to dumping printable runs of whole file
  // (that is what produced %PDF / font garbage for users).
  if (text.replace(/\s/g, "").length < 30) {
    return "";
  }

  if (looksLikeRawPdf(text)) {
    return "";
  }

  return text;
}

export async function extractTextFromFile(
  file: File
): Promise<{ text: string; kind: "text" | "pdf" }> {
  const name = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";

  if (isPdf) {
    const buf = await file.arrayBuffer();
    const text = extractTextFromPdfBytes(new Uint8Array(buf));
    if (!text.trim()) {
      throw new Error("PDF_NO_TEXT");
    }
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

  let text = await file.text();
  // User may rename PDF as .txt — refuse raw PDF dumps
  if (looksLikeRawPdf(text)) {
    const buf = await file.arrayBuffer();
    text = extractTextFromPdfBytes(new Uint8Array(buf));
    if (!text.trim()) throw new Error("PDF_NO_TEXT");
    return { text: cleanExtractedText(text), kind: "pdf" };
  }

  text = cleanExtractedText(text);
  if (!text.trim()) throw new Error("EMPTY");
  return { text, kind: "text" };
}
