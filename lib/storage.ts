import { put, del } from "@vercel/blob";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const isVercelBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

/**
 * 判斷是否使用 Vercel Blob
 */
export function usesBlobStorage(): boolean {
  return isVercelBlob;
}

/**
 * 上傳檔案（伺服器端，用於本地開發 fallback）
 */
export async function uploadFile(
  filename: string,
  data: Buffer
): Promise<string> {
  if (isVercelBlob) {
    const blob = await put(`uploads/${filename}`, data, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  } else {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), data);
    return `/uploads/${filename}`;
  }
}

/**
 * 刪除檔案（Blob 或本地）
 */
export async function deleteFile(urlOrFilename: string): Promise<void> {
  if (
    urlOrFilename.startsWith("http://") ||
    urlOrFilename.startsWith("https://")
  ) {
    await del(urlOrFilename);
  } else {
    const filePath = urlOrFilename.startsWith("/uploads/")
      ? path.join(process.cwd(), "public", urlOrFilename)
      : path.join(UPLOADS_DIR, urlOrFilename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

/**
 * 讀取檔案內容為 Buffer
 * URL 開頭用 fetch，否則用 fs.readFileSync
 */
export async function readFile(urlOrFilename: string): Promise<Buffer> {
  if (
    urlOrFilename.startsWith("http://") ||
    urlOrFilename.startsWith("https://")
  ) {
    const response = await fetch(urlOrFilename);
    if (!response.ok) {
      throw new Error(
        `無法讀取檔案: ${response.status} ${response.statusText}`
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } else {
    const filePath = urlOrFilename.startsWith("/uploads/")
      ? path.join(process.cwd(), "public", urlOrFilename)
      : path.join(UPLOADS_DIR, urlOrFilename);
    return fs.readFileSync(filePath) as Buffer;
  }
}
