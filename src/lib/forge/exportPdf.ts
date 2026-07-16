/**
 * Professional CV PDF export without external packages.
 * Builds a real PDF (Helvetica text + optional JPEG photo) and downloads it.
 */

import type { ParsedCV } from "./types";

function pdfEscape(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]/g, " ");
}

function wrapLine(text: string, max = 88): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > max) {
      if (cur) lines.push(cur);
      cur = w.length > max ? w.slice(0, max) : w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

async function photoToJpeg(
  dataUrl: string
): Promise<{ bytes: Uint8Array; w: number; h: number } | null> {
  try {
    const img = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("img"));
    });
    img.src = dataUrl;
    await loaded;
    const max = 320;
    const scale = Math.min(1, max / Math.max(img.width, img.height, 1));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
    );
    if (!blob) return null;
    return { bytes: new Uint8Array(await blob.arrayBuffer()), w, h };
  } catch {
    return null;
  }
}

function buildContentStream(
  cv: ParsedCV,
  image?: { w: number; h: number } | null
): string {
  const ops: string[] = [];
  let y = 800;
  const left = 50;
  const right = 545;

  const textAt = (str: string, size: number, bold: boolean, x: number, yy: number) => {
    ops.push("BT");
    ops.push(`/${bold ? "F2" : "F1"} ${size} Tf`);
    ops.push(`${x} ${yy} Td`);
    ops.push(`(${pdfEscape(str)}) Tj`);
    ops.push("ET");
  };

  if (image) {
    const iw = 70;
    const ih = (image.h / Math.max(image.w, 1)) * iw;
    const ix = right - iw;
    const iy = 842 - 48 - ih;
    ops.push("q");
    ops.push(`${iw.toFixed(2)} 0 0 ${ih.toFixed(2)} ${ix.toFixed(2)} ${iy.toFixed(2)} cm`);
    ops.push("/Im1 Do");
    ops.push("Q");
  }

  textAt(cv.name || "Candidate", 20, true, left, y);
  y -= 26;
  textAt(cv.title || "Professional", 12, false, left, y);
  y -= 18;

  const contact = [cv.email, cv.phone, cv.location].filter(Boolean).join("   ·   ");
  if (contact) {
    textAt(contact, 9, false, left, y);
    y -= 16;
  }

  // accent rule
  ops.push("0.91 0.36 0.23 RG");
  ops.push("1.2 w");
  ops.push(`${left} ${y} m ${right} ${y} l S`);
  ops.push("0 0 0 RG");
  y -= 22;

  const section = (title: string) => {
    y -= 4;
    textAt(title.toUpperCase(), 10, true, left, y);
    y -= 8;
    ops.push("0.91 0.36 0.23 RG");
    ops.push("0.9 w");
    ops.push(`${left} ${y + 4} m ${left + 72} ${y + 4} l S`);
    ops.push("0 0 0 RG");
    y -= 6;
  };

  if (cv.summary) {
    section("Summary");
    for (const ln of wrapLine(cv.summary, 92)) {
      textAt(ln, 9, false, left, y);
      y -= 12;
    }
    y -= 6;
  }

  if (cv.experience.length) {
    section("Experience");
    for (const exp of cv.experience) {
      textAt(`${exp.position}  |  ${exp.company}`, 10, true, left, y);
      y -= 13;
      textAt(exp.duration, 8, false, left, y);
      y -= 12;
      for (const d of exp.description) {
        for (const ln of wrapLine(`•  ${d}`, 90)) {
          textAt(ln, 9, false, left, y);
          y -= 12;
        }
      }
      y -= 6;
      if (y < 60) break;
    }
  }

  if (cv.skills.length && y > 80) {
    section("Skills");
    for (const ln of wrapLine(cv.skills.join("  ·  "), 92)) {
      textAt(ln, 9, false, left, y);
      y -= 12;
    }
    y -= 6;
  }

  if (cv.education.length && y > 80) {
    section("Education");
    for (const ed of cv.education) {
      textAt(ed.school, 10, true, left, y);
      y -= 13;
      textAt(`${ed.degree}  ·  ${ed.year}`, 9, false, left, y);
      y -= 14;
    }
  }

  // footer
  textAt("SoftBridge CareerForge", 7, false, left, 36);

  return ops.join("\n");
}

function assemblePdf(
  stream: string,
  image?: { bytes: Uint8Array; w: number; h: number }
): Uint8Array {
  const bin: number[] = [];
  const wstr = (s: string) => {
    for (let i = 0; i < s.length; i++) bin.push(s.charCodeAt(i) & 0xff);
  };
  const wbytes = (u: Uint8Array) => {
    for (let i = 0; i < u.length; i++) bin.push(u[i]!);
  };

  const hasImg = Boolean(image);
  const res = hasImg
    ? "<< /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Im1 7 0 R >> >>"
    : "<< /Font << /F1 4 0 R /F2 5 0 R >> >>";

  wstr("%PDF-1.4\n");
  const offsets: number[] = [0];

  const obj = (num: number, body: string, binary?: Uint8Array) => {
    offsets[num] = bin.length;
    wstr(`${num} 0 obj\n`);
    wstr(body);
    if (binary) {
      wbytes(binary);
      wstr("\nendstream\nendobj\n");
    } else {
      wstr("\nendobj\n");
    }
  };

  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 6 0 R /Resources ${res} >>`
  );
  obj(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  obj(5, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  obj(6, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  if (hasImg && image) {
    obj(
      7,
      `<< /Type /XObject /Subtype /Image /Width ${image.w} /Height ${image.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`,
      image.bytes
    );
  }

  const xrefPos = bin.length;
  const size = hasImg ? 8 : 7;
  wstr(`xref\n0 ${size}\n`);
  wstr("0000000000 65535 f \n");
  for (let i = 1; i < size; i++) {
    wstr(`${String(offsets[i] ?? 0).padStart(10, "0")} 00000 n \n`);
  }
  wstr(`trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`);

  return new Uint8Array(bin);
}

export async function exportCvAsPdf(cv: ParsedCV, filename?: string) {
  let image: { bytes: Uint8Array; w: number; h: number } | undefined;
  if (cv.photoDataUrl) {
    const jpg = await photoToJpeg(cv.photoDataUrl);
    if (jpg) image = jpg;
  }
  const stream = buildContentStream(cv, image ? { w: image.w, h: image.h } : null);
  const pdf = assemblePdf(stream, image);
  const copy = new Uint8Array(pdf.byteLength);
  copy.set(pdf);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ||
    `${(cv.name || "cv").replace(/[^\w\-]+/g, "-").toLowerCase()}-careerforge.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
