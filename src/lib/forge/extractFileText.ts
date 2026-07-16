/**
 * Extract readable text from TXT/MD and PDF files.
 * Uses fflate (already in the project) to decompress FlateDecode content streams
 * so normal text PDFs work. Never returns raw %PDF garbage to the UI.
 */

import { inflateSync, unzlibSync } from "fflate";

const PDF_META =
  /(%PDF|\/Type|\/Font|\/Encoding|\/BaseFont|\/Subtype|\/Length|\/Filter|\/FlateDecode|\/Pages|\/Page|\/MediaBox|\/Parent|\/Kids|\/Count|\/Resources|\/Contents|\/ProcSet|\/ExtGState|\/XObject|endstream|endobj|startxref|\/DecodeParms|\/Width|\/Height|\/BitsPerComponent|\/ColorSpace)/i;

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
      return code >= 32 && code < 0x10000 ? String.fromCharCode(code) : " ";
    });
}

function bytesToLatin1(bytes: Uint8Array): string {
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

function latin1ToBytes(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
}

function tryInflate(data: Uint8Array): Uint8Array | null {
  if (!data.length) return null;
  // PDF FlateDecode is usually zlib-wrapped
  try {
    return unzlibSync(data);
  } catch {
    /* continue */
  }
  try {
    return inflateSync(data);
  } catch {
    /* continue */
  }
  // Some producers omit zlib header quirks — try skipping first 2 bytes
  if (data.length > 6) {
    try {
      return inflateSync(data.subarray(2));
    } catch {
      /* continue */
    }
  }
  return null;
}

function isHumanSnippet(s: string): boolean {
  const t = s.trim();
  if (t.length < 1 || t.length > 800) return false;
  if (PDF_META.test(t)) return false;
  if (/^[\d.\-,\s]+$/.test(t) && t.length < 3) return false;
  let letters = 0;
  let bad = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    if (c < 9 || (c > 13 && c < 32)) bad++;
    if (/\p{L}/u.test(t[i]!)) letters++;
  }
  if (bad / t.length > 0.12) return false;
  // allow short tokens (names, years) if mostly letters/digits
  if (t.length <= 3) return /[\p{L}\p{N}@]/u.test(t);
  return letters >= 1 || /@|\d{4}/.test(t);
}

/** Pull text-showing operators from a content stream string. */
function extractOperators(content: string): string[] {
  const parts: string[] = [];

  // (text) Tj  |  (text) '  |  (text) "
  const parenRe = /\(((?:\\.|[^\\()])*?)\)\s*(?:Tj|'|")/g;
  let m: RegExpExecArray | null;
  while ((m = parenRe.exec(content))) {
    const decoded = decodePdfEscapes(m[1]);
    if (decoded && isHumanSnippet(decoded)) parts.push(decoded);
  }

  // [(parts) ...] TJ
  const tjArrayRe = /\[([\s\S]*?)\]\s*TJ/g;
  while ((m = tjArrayRe.exec(content))) {
    const inner = m[1];
    const strRe = /\(((?:\\.|[^\\()])*?)\)/g;
    let sm: RegExpExecArray | null;
    let line = "";
    while ((sm = strRe.exec(inner))) {
      line += decodePdfEscapes(sm[1]);
    }
    line = line.replace(/\s+/g, " ").trim();
    if (line && isHumanSnippet(line)) parts.push(line);
  }

  // <hex> Tj — UTF-16BE or ASCII
  const hexRe = /<([0-9A-Fa-f\s]+)>\s*Tj/g;
  while ((m = hexRe.exec(content))) {
    const hex = m[1].replace(/\s/g, "");
    if (hex.length < 2 || hex.length % 2 !== 0) continue;
    let s = "";
    const isUtf16 = hex.length >= 4 && (hex.startsWith("00") || hex.startsWith("FEFF") || /00[0-9A-F]{2}/i.test(hex.slice(0, 8)));
    if (isUtf16 && hex.length % 4 === 0) {
      for (let i = 0; i + 3 < hex.length; i += 4) {
        const code = parseInt(hex.slice(i, i + 4), 16);
        if (code === 0xfeff) continue;
        if (code >= 32 && code < 0xd800) s += String.fromCharCode(code);
        else if (code === 0 || code === 0x0a || code === 0x0d) s += " ";
      }
    } else {
      for (let i = 0; i < hex.length; i += 2) {
        const code = parseInt(hex.slice(i, i + 2), 16);
        if (code >= 32 && code < 127) s += String.fromCharCode(code);
        else if (code === 0) s += " ";
      }
    }
    s = s.replace(/\s+/g, " ").trim();
    if (s && isHumanSnippet(s)) parts.push(s);
  }

  return parts;
}

function cleanLines(parts: string[]): string {
  const lines: string[] = [];
  let wordBuf = "";

  const flushWords = () => {
    if (wordBuf.length >= 2) lines.push(wordBuf);
    wordBuf = "";
  };

  for (const raw of parts) {
    let t = raw
      .replace(/\u0000/g, "")
      .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!t || PDF_META.test(t)) continue;
    if (/^%PDF/.test(t)) continue;

    // Character-by-character PDFs
    if (t.length === 1 && /\p{L}|\p{N}/u.test(t)) {
      wordBuf += t;
      continue;
    }
    flushWords();

    t = t.replace(/[^\p{L}\p{N}\p{P}\p{Zs}@+#/&%°'’\-–—()[\]{}:;,./\\|+*=<>€$£₺]/gu, "").trim();
    if (!t) continue;
    if (t.length < 2 && !/\p{L}|\p{N}/u.test(t)) continue;
    lines.push(t);
  }
  flushWords();

  // Join consecutive single-word lines into sentences when helpful
  const joined: string[] = [];
  for (const line of lines) {
    const prev = joined[joined.length - 1];
    if (
      prev &&
      prev.length < 40 &&
      !/[.!?]$/.test(prev) &&
      line.length < 40 &&
      !/^[A-Z][A-Z\s]{3,}$/.test(line) // don't glue ALL CAPS headers
    ) {
      // if previous looks like partial, glue with space
      if (!prev.includes(" ") && line.length < 20) {
        joined[joined.length - 1] = `${prev} ${line}`;
        continue;
      }
    }
    joined.push(line);
  }

  return joined.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function cleanExtractedText(text: string): string {
  const parts = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  return cleanLines(parts);
}

export function looksLikeRawPdf(text: string): boolean {
  const head = text.slice(0, 800);
  if (/%PDF-?\d/.test(head)) return true;
  if (/\/FlateDecode|endstream|startxref|\/Type\s*\/Catalog/.test(text.slice(0, 5000))) {
    const sample = text.slice(0, 2500);
    const letters = (sample.match(/\p{L}/gu) ?? []).length;
    if (letters / Math.max(sample.length, 1) < 0.3) return true;
  }
  return false;
}

export function isLikelyHumanText(s: string): boolean {
  return isHumanSnippet(s);
}

interface StreamBlock {
  dict: string;
  data: Uint8Array;
}

/** Locate stream...endstream pairs with preceding dictionary. */
function findStreams(bytes: Uint8Array): StreamBlock[] {
  const raw = bytesToLatin1(bytes);
  const blocks: StreamBlock[] = [];
  const re = /<<([\s\S]*?)>>\s*stream\r?\n([\s\S]*?)endstream/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const dict = m[1];
    let dataStr = m[2];
    // PDF allows \r\n after stream keyword; data may end with \n before endstream
    if (dataStr.endsWith("\r")) dataStr = dataStr.slice(0, -1);
    if (dataStr.endsWith("\n")) dataStr = dataStr.slice(0, -1);
    blocks.push({ dict, data: latin1ToBytes(dataStr) });
  }
  return blocks;
}

function dictHasFlate(dict: string): boolean {
  return /\/Filter\s*\/FlateDecode|\/Filter\s*\[\s*\/FlateDecode/i.test(dict);
}

function dictLooksLikeImage(dict: string): boolean {
  return /\/Subtype\s*\/Image|\/DCTDecode|\/JPXDecode|\/CCITTFaxDecode|\/JBIG2Decode/i.test(dict);
}

function dictLooksLikeContent(dict: string): boolean {
  // Prefer page content streams (not pure fonts/images)
  if (dictLooksLikeImage(dict)) return false;
  if (/\/Subtype\s*\/Type1|\/Subtype\s*\/TrueType|\/Subtype\s*\/Type0|\/FontFile/i.test(dict)) {
    return false;
  }
  return true;
}

/**
 * Extract text from PDF bytes. Returns empty string if nothing readable
 * (caller maps empty + image-only → scanned message).
 */
export function extractTextFromPdfBytes(bytes: Uint8Array): {
  text: string;
  likelyScanned: boolean;
} {
  if (bytes.length < 8) return { text: "", likelyScanned: false };

  const streams = findStreams(bytes);
  let imageStreams = 0;
  let contentAttempts = 0;
  const snippets: string[] = [];

  for (const block of streams) {
    if (dictLooksLikeImage(block.dict)) {
      imageStreams++;
      continue;
    }
    if (!dictLooksLikeContent(block.dict) && dictHasFlate(block.dict)) {
      // still try — some content dicts are minimal
    }

    contentAttempts++;
    let payload = block.data;

    // Honor /Length when present (trim padding)
    const lenMatch = block.dict.match(/\/Length\s+(\d+)/);
    if (lenMatch) {
      const len = parseInt(lenMatch[1], 10);
      if (len > 0 && len <= payload.length) payload = payload.subarray(0, len);
    }

    let contentBytes = payload;
    if (dictHasFlate(block.dict) || (payload[0] === 0x78 && (payload[1] === 0x9c || payload[1] === 0x01 || payload[1] === 0xda))) {
      const inflated = tryInflate(payload);
      if (inflated) contentBytes = inflated;
      else if (dictHasFlate(block.dict)) continue; // compressed but can't inflate — skip
    }

    const contentStr = bytesToLatin1(contentBytes);
    // Only parse if it looks like content operators, not pure binary
    if (!/Tj|TJ|BT|ET|'|"/.test(contentStr) && contentStr.length > 200) {
      // maybe uncompressed text without operators — skip binary
      const printable = (contentStr.match(/[\x20-\x7E\n\r\t]/g) ?? []).length;
      if (printable / contentStr.length < 0.6) continue;
    }

    const ops = extractOperators(contentStr);
    snippets.push(...ops);

    // Also catch BT ... ET blocks for nested strings we might miss
    const btRe = /BT([\s\S]*?)ET/g;
    let bt: RegExpExecArray | null;
    while ((bt = btRe.exec(contentStr))) {
      snippets.push(...extractOperators(bt[1]));
    }
  }

  // Uncompressed literal strings anywhere near Tj (fallback for simple PDFs)
  if (snippets.length < 5) {
    const raw = bytesToLatin1(bytes);
    snippets.push(...extractOperators(raw));
  }

  const text = cleanLines(snippets);
  const letterCount = (text.match(/\p{L}/gu) ?? []).length;
  const likelyScanned =
    letterCount < 40 && imageStreams > 0 && contentAttempts >= 0 && text.replace(/\s/g, "").length < 40;

  if (letterCount < 25 && text.replace(/\s/g, "").length < 30) {
    return { text: "", likelyScanned: likelyScanned || imageStreams > 0 };
  }

  if (looksLikeRawPdf(text)) {
    return { text: "", likelyScanned: imageStreams > 0 };
  }

  return { text, likelyScanned: false };
}

export async function extractTextFromFile(
  file: File
): Promise<{ text: string; kind: "text" | "pdf" }> {
  const name = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";

  if (isPdf) {
    const buf = await file.arrayBuffer();
    const { text, likelyScanned } = extractTextFromPdfBytes(new Uint8Array(buf));
    if (!text.trim()) {
      throw new Error(likelyScanned ? "PDF_SCANNED" : "PDF_NO_TEXT");
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
  if (looksLikeRawPdf(text) || text.trimStart().startsWith("%PDF")) {
    const buf = await file.arrayBuffer();
    const { text: pdfText, likelyScanned } = extractTextFromPdfBytes(new Uint8Array(buf));
    if (!pdfText.trim()) {
      throw new Error(likelyScanned ? "PDF_SCANNED" : "PDF_NO_TEXT");
    }
    return { text: pdfText, kind: "pdf" };
  }

  text = cleanExtractedText(text);
  if (!text.trim()) throw new Error("EMPTY");
  return { text, kind: "text" };
}
