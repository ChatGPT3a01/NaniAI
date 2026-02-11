import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function extractTextFromPdf(
  filename: string,
  startPage: number,
  endPage: number
): Promise<string> {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const filePath = path.join(UPLOADS_DIR, filename);
  const dataBuffer = new Uint8Array(fs.readFileSync(filePath));

  const doc = await pdfjsLib.getDocument({ data: dataBuffer }).promise;

  const pages: string[] = [];
  const end = Math.min(endPage, doc.numPages);

  for (let i = startPage; i <= end; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }

  doc.destroy();
  return pages.join("\n\n--- 頁面分隔 ---\n\n").trim();
}

export async function getPdfPageCount(filename: string): Promise<number> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const filePath = path.join(UPLOADS_DIR, filename);
  const dataBuffer = new Uint8Array(fs.readFileSync(filePath));

  const doc = await pdfjsLib.getDocument({ data: dataBuffer }).promise;
  const numPages = doc.numPages;
  doc.destroy();
  return numPages;
}
