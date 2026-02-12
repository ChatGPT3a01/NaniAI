import { readFile } from "@/lib/storage";

export async function extractTextFromPdf(
  fileUrl: string,
  startPage: number,
  endPage: number
): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const buffer = await readFile(fileUrl);
  const dataBuffer = new Uint8Array(buffer);

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

export async function getPdfPageCount(fileUrl: string): Promise<number> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const buffer = await readFile(fileUrl);
  const dataBuffer = new Uint8Array(buffer);

  const doc = await pdfjsLib.getDocument({ data: dataBuffer }).promise;
  const numPages = doc.numPages;
  doc.destroy();
  return numPages;
}
