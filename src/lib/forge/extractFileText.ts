/**
 * Reliable PDF/TXT text extraction for CareerForge.
 * - Decompresses FlateDecode streams with fflate
 * - Never returns raw %PDF / font / xref garbage to the UI
 */

import { inflateSync, unzipSync, unzlibSync } from "fflate";

interface PdfTextItem {
  str: string;
  transform: number[];
}

interface PdfPage {
  getTextContent: () => Promise<{ items: PdfTextItem[] }>;
}

interface PdfDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
}

interface PdfJsLibrary {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: Uint8Array }) => { promise: Promise<PdfDocument> };
}

declare global {
  interface Window {
    pdfjsLib?: PdfJsLibrary;
  }
}

function decodePdfStringEscapes(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{1,3})/g, (_, oct: string) => {
      const code = parseInt(oct, 8);
      if (Number.isNaN(code) || code < 32) return " ";
      return String.fromCharCode(code);
    });
}

function tryInflate(data: Uint8Array): Uint8Array | null {
  if (data.length < 2) return null;
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
  if (data.length > 6) {
    try {
      return inflateSync(data.subarray(2));
    } catch {
      /* continue */
    }
  }
  return null;
}

function indexOfBytes(hay: Uint8Array, needle: number[], from = 0): number {
  outer: for (let i = from; i <= hay.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (hay[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

function bytesToLatin1(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return s;
}

function isMostlyPrintable(s: string): boolean {
  if (!s) return false;
  let ok = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 9 || c === 10 || c === 13 || (c >= 32 && c < 127) || c >= 160) ok++;
  }
  return ok / s.length > 0.55;
}

function extractTextOps(content: string): string[] {
  const out: string[] = [];

  // (Hello World) Tj
  const tj = /\(((?:\\.|[^\\()])*?)\)\s*(?:Tj|'|")/g;
  let m: RegExpExecArray | null;
  while ((m = tj.exec(content))) {
    const t = decodePdfStringEscapes(m[1]).replace(/\s+/g, " ").trim();
    if (t.length >= 1) out.push(t);
  }

  // [(Hel) -20 (lo)] TJ
  const tja = /\[([\s\S]*?)\]\s*TJ/g;
  while ((m = tja.exec(content))) {
    let line = "";
    const parts = /\(((?:\\.|[^\\()])*?)\)/g;
    let p: RegExpExecArray | null;
    while ((p = parts.exec(m[1]))) {
      line += decodePdfStringEscapes(p[1]);
    }
    line = line.replace(/\s+/g, " ").trim();
    if (line) out.push(line);
  }

  // <00480065> Tj (UTF-16BE or ASCII hex)
  const hex = /<([0-9A-Fa-f\s]+)>\s*Tj/g;
  while ((m = hex.exec(content))) {
    const h = m[1].replace(/\s/g, "");
    if (h.length < 2 || h.length % 2) continue;
    let s = "";
    const utf16 = h.length % 4 === 0 && (/^00|feff/i.test(h.slice(0, 4)) || (h.match(/00/g) || []).length >= h.length / 8);
    if (utf16) {
      for (let i = 0; i + 3 < h.length; i += 4) {
        const code = parseInt(h.slice(i, i + 4), 16);
        if (code === 0xfeff) continue;
        if (code >= 32 && code < 0xd800) s += String.fromCharCode(code);
        else if (code === 0 || code === 10 || code === 13) s += " ";
      }
    } else {
      for (let i = 0; i < h.length; i += 2) {
        const code = parseInt(h.slice(i, i + 2), 16);
        if (code >= 32 && code < 127) s += String.fromCharCode(code);
      }
    }
    s = s.replace(/\s+/g, " ").trim();
    if (s) out.push(s);
  }

  return out;
}

const GARBAGE_LINE =
  /^(%PDF|obj|endobj|stream|endstream|xref|trailer|startxref|\/Type|\/Font|\/Length|\/Filter|\/FlateDecode|\/Subtype|\/BaseFont|\/Encoding|\/Pages|\/Page|\/MediaBox|\/Resources|\/Contents|\/Parent|\/Kids|\/Count|\/XObject|\/ProcSet|\/ExtGState|\/Width|\/Height|\/BitsPerComponent|\/ColorSpace|\/DecodeParms)/i;

function isHumanLine(line: string): boolean {
  const t = line.trim();
  if (t.length < 2) return false;
  if (GARBAGE_LINE.test(t)) return false;
  if (/%PDF|endobj|endstream|FlateDecode/i.test(t)) return false;
  // need some letters
  const letters = (t.match(/\p{L}/gu) || []).length;
  if (letters < 1 && !/\d{4}|@/.test(t)) return false;
  // reject high binary residue
  let bad = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    if (c < 9 || (c > 13 && c < 32)) bad++;
  }
  if (bad / t.length > 0.1) return false;
  return true;
}

export function cleanExtractedText(text: string): string {
  const t = text
    .replace(/%PDF-[\d.]+/gi, " ")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const rawLines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  const kept: string[] = [];
  let charBuf = "";

  const flushChars = () => {
    if (charBuf.length >= 2 && isHumanLine(charBuf)) kept.push(charBuf);
    charBuf = "";
  };

  for (let line of rawLines) {
    if (GARBAGE_LINE.test(line)) continue;
    line = line
      .replace(/[^\p{L}\p{N}\p{P}\p{Zs}@+#/&%°'’\-–—()[\]{}:;,./\\|+*=<>€$£₺]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!line) continue;

    // single-char PDF fragmentation
    if (line.length === 1 && /\p{L}|\p{N}/u.test(line)) {
      charBuf += line;
      continue;
    }
    flushChars();
    if (isHumanLine(line)) kept.push(line);
  }
  flushChars();

  // de-dupe consecutive identical lines
  const deduped: string[] = [];
  for (const l of kept) {
    if (deduped[deduped.length - 1] === l) continue;
    deduped.push(l);
  }

  return deduped.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function looksLikeRawPdf(text: string): boolean {
  const head = text.slice(0, 1200);
  if (/%PDF-?\d/.test(head)) return true;
  if (/\/FlateDecode|endstream|startxref|\/Type\s*\/Catalog|endobj/.test(text.slice(0, 8000))) {
    const sample = text.slice(0, 3000);
    const letters = (sample.match(/\p{L}/gu) || []).length;
    if (letters / Math.max(sample.length, 1) < 0.28) return true;
  }
  return false;
}

export function isLikelyHumanText(s: string): boolean {
  return isHumanLine(s);
}

interface StreamHit {
  dict: string;
  data: Uint8Array;
}

/** Find dictionary + stream pairs using byte search (robust for binary PDFs). */
function findStreams(bytes: Uint8Array): StreamHit[] {
  const hits: StreamHit[] = [];
  const streamWord = [0x73, 0x74, 0x72, 0x65, 0x61, 0x6d]; // stream
  const endWord = [0x65, 0x6e, 0x64, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6d]; // endstream
  let pos = 0;

  while (pos < bytes.length) {
    const sIdx = indexOfBytes(bytes, streamWord, pos);
    if (sIdx < 0) break;

    // keyword must be boundary-ish (not part of longer token)
    const before = sIdx > 0 ? bytes[sIdx - 1]! : 10;
    if (before > 32 && before !== 0x0d && before !== 0x0a && before !== 0x3e /* > */) {
      pos = sIdx + 6;
      continue;
    }

    let dataStart = sIdx + 6;
    // skip whitespace / single EOL after "stream"
    if (bytes[dataStart] === 0x0d && bytes[dataStart + 1] === 0x0a) dataStart += 2;
    else if (bytes[dataStart] === 0x0a || bytes[dataStart] === 0x0d) dataStart += 1;

    const eIdx = indexOfBytes(bytes, endWord, dataStart);
    if (eIdx < 0) break;

    // dictionary: look back up to 2.5kb for last << ... >> before stream
    const lookBack = Math.max(0, sIdx - 2500);
    const dictRegion = bytesToLatin1(bytes.subarray(lookBack, sIdx));
    const dictMatch = dictRegion.match(/<<[\s\S]*>>\s*$/);
    const dict = dictMatch ? dictMatch[0] : "";

    let data = bytes.subarray(dataStart, eIdx);
    // trim trailing CR/LF that belongs before endstream
    while (data.length && (data[data.length - 1] === 0x0a || data[data.length - 1] === 0x0d)) {
      data = data.subarray(0, data.length - 1);
    }

    const lenM = dict.match(/\/Length\s+(\d+)/);
    if (lenM) {
      const len = parseInt(lenM[1], 10);
      if (len > 0 && len <= data.length) data = data.subarray(0, len);
    }

    hits.push({ dict, data: new Uint8Array(data) });
    pos = eIdx + 9;
  }

  return hits;
}

function dictIsImage(dict: string): boolean {
  return /\/Subtype\s*\/Image|\/DCTDecode|\/JPXDecode|\/CCITTFaxDecode|\/JBIG2Decode/i.test(dict);
}

function dictIsFont(dict: string): boolean {
  return /\/Subtype\s*\/(Type1|TrueType|Type0|CIDFont)|\/FontFile|\/ToUnicode/i.test(dict);
}

function dictHasFlate(dict: string): boolean {
  return /\/Filter\s*\/FlateDecode|\/Filter\s*\[\s*\/FlateDecode/i.test(dict);
}

/**
 * Extract text from PDF bytes.
 * Returns empty text + likelyScanned when only images / no readable text.
 */
export function extractTextFromPdfBytes(bytes: Uint8Array): {
  text: string;
  likelyScanned: boolean;
} {
  if (bytes.length < 8) return { text: "", likelyScanned: false };

  const streams = findStreams(bytes);
  let images = 0;
  const snippets: string[] = [];

  for (const st of streams) {
    if (dictIsImage(st.dict)) {
      images++;
      continue;
    }
    if (dictIsFont(st.dict)) continue;

    let payload = st.data;
    const maybeCompressed =
      dictHasFlate(st.dict) ||
      (payload[0] === 0x78 && (payload[1] === 0x01 || payload[1] === 0x9c || payload[1] === 0xda));

    if (maybeCompressed) {
      const inflated = tryInflate(payload);
      if (inflated) payload = inflated;
      else if (dictHasFlate(st.dict)) continue;
    }

    const content = bytesToLatin1(payload);
    if (!/Tj|TJ|\bBT\b|\bET\b|'|"/.test(content)) {
      if (!isMostlyPrintable(content)) continue;
    }

    snippets.push(...extractTextOps(content));

    // BT ... ET blocks
    const bt = /BT([\s\S]*?)ET/g;
    let bm: RegExpExecArray | null;
    while ((bm = bt.exec(content))) {
      snippets.push(...extractTextOps(bm[1]));
    }
  }

  // Fallback: operator scan on whole file (uncompressed simple PDFs)
  if (snippets.length < 3) {
    const raw = bytesToLatin1(bytes);
    // only scan limited printable-ish chunks to avoid garbage flood
    snippets.push(...extractTextOps(raw));
  }

  const text = cleanExtractedText(snippets.join("\n"));
  const letters = (text.match(/\p{L}/gu) || []).length;

  if (letters < 20 || text.replace(/\s/g, "").length < 25) {
    return { text: "", likelyScanned: images > 0 || streams.length > 0 };
  }

  if (looksLikeRawPdf(text)) {
    return { text: "", likelyScanned: images > 0 };
  }

  return { text, likelyScanned: false };
}

async function loadPdfJS(): Promise<PdfJsLibrary> {
  if (typeof window === "undefined") {
    throw new Error("Window not defined");
  }
  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/pdfjs/pdf.min.js";
    script.onload = () => {
      const pdfjsLib = window.pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";
        resolve(pdfjsLib);
      } else {
        reject(new Error("pdfjsLib not found on window"));
      }
    };
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

export async function extractTextWithPdfJS(bytes: Uint8Array): Promise<string> {
  const pdfjsLib = await loadPdfJS();
  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pageTexts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;
    if (items.length === 0) continue;

    const itemsWithY = items.map(item => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5]
    }));

    // Sort: top to bottom (Y descending), then left to right (X ascending)
    itemsWithY.sort((a, b) => {
      if (Math.abs(a.y - b.y) < 4) {
        return a.x - b.x;
      }
      return b.y - a.y;
    });

    let pageText = "";
    let lastY = -1;
    for (const item of itemsWithY) {
      if (lastY !== -1 && Math.abs(item.y - lastY) >= 4) {
        pageText += "\n";
      } else if (pageText.length > 0 && !pageText.endsWith("\n") && !pageText.endsWith(" ")) {
        pageText += " ";
      }
      pageText += item.str;
      lastY = item.y;
    }
    pageTexts.push(pageText);
  }

  return pageTexts.join("\n\n");
}

export async function extractTextFromFile(
  file: File
): Promise<{ text: string; kind: "text" | "pdf" }> {
  const maxFileBytes = 10 * 1024 * 1024;
  if (file.size > maxFileBytes) throw new Error("TOO_LARGE");
  const name = file.name.toLowerCase();
  const isPdf =
    name.endsWith(".pdf") ||
    file.type === "application/pdf" ||
    file.type === "application/x-pdf";
  const isDocx =
    name.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  if (isDocx) {
    const archive = unzipSync(new Uint8Array(await file.arrayBuffer()));
    const documentXml = archive["word/document.xml"];
    if (!documentXml) throw new Error("UNSUPPORTED");
    if (documentXml.byteLength > 4 * 1024 * 1024) throw new Error("TOO_LARGE");
    const xml = new TextDecoder("utf-8").decode(documentXml);
    const document = new DOMParser().parseFromString(xml, "application/xml");
    if (document.querySelector("parsererror")) throw new Error("UNSUPPORTED");
    const paragraphs = Array.from(document.getElementsByTagNameNS("*", "p"));
    const text = cleanExtractedText(paragraphs.map((paragraph) =>
      Array.from(paragraph.getElementsByTagNameNS("*", "t")).map((node) => node.textContent ?? "").join("")
    ).join("\n"));
    if (!text.trim()) throw new Error("EMPTY");
    return { text, kind: "text" };
  }

  if (isPdf) {
    const buf = new Uint8Array(await file.arrayBuffer());
    // magic header
    const magic = String.fromCharCode(buf[0] || 0, buf[1] || 0, buf[2] || 0, buf[3] || 0);
    
    // Try PDF.js first
    try {
      const pdfjsText = await extractTextWithPdfJS(buf);
      const cleaned = cleanExtractedText(pdfjsText);
      if (cleaned.trim().length > 20 && !looksLikeRawPdf(cleaned)) {
        return { text: cleaned, kind: "pdf" };
      }
    } catch (e) {
      console.warn("PDF.js loading/parsing failed, falling back to manual extractor:", e);
    }

    const { text, likelyScanned } = extractTextFromPdfBytes(buf);
    if (!text.trim()) {
      throw new Error(likelyScanned || magic.startsWith("%PDF") ? "PDF_SCANNED" : "PDF_NO_TEXT");
    }
    // final safety: never return garbage
    if (looksLikeRawPdf(text)) throw new Error("PDF_SCANNED");
    return { text, kind: "pdf" };
  }

  const isTextLike =
    file.type.startsWith("text/") ||
    file.type === "application/json" ||
    file.type === "" ||
    /\.(txt|md|markdown|csv|json|log|rtf)$/i.test(file.name);

  if (!isTextLike) throw new Error("UNSUPPORTED");

  let text = await file.text();
  if (text.trimStart().startsWith("%PDF") || looksLikeRawPdf(text)) {
    const buf = new Uint8Array(await file.arrayBuffer());
    // Try PDF.js first
    try {
      const pdfjsText = await extractTextWithPdfJS(buf);
      const cleaned = cleanExtractedText(pdfjsText);
      if (cleaned.trim().length > 20 && !looksLikeRawPdf(cleaned)) {
        return { text: cleaned, kind: "pdf" };
      }
    } catch (e) {
      console.warn("PDF.js loading/parsing failed, falling back to manual extractor:", e);
    }

    const { text: pdfText, likelyScanned } = extractTextFromPdfBytes(buf);
    if (!pdfText.trim()) throw new Error(likelyScanned ? "PDF_SCANNED" : "PDF_NO_TEXT");
    if (looksLikeRawPdf(pdfText)) throw new Error("PDF_SCANNED");
    return { text: pdfText, kind: "pdf" };
  }

  text = cleanExtractedText(text);
  if (!text.trim()) throw new Error("EMPTY");
  if (looksLikeRawPdf(text)) throw new Error("PDF_SCANNED");
  return { text, kind: "text" };
}
