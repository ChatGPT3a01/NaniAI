import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { getPdfPageCount } from "@/lib/pdf-extract";
import { uploadFile } from "@/lib/storage";

export async function GET() {
  try {
    const db = getDb();
    const books = db.prepare("SELECT * FROM books ORDER BY created_at DESC").all();
    return NextResponse.json({ books });
  } catch (error) {
    console.error("取得書籍列表失敗:", error);
    return NextResponse.json({ error: "取得書籍列表失敗" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const id = generateId();

    let title: string;
    let subject: string | null;
    let grade: string | null;
    let blobUrl: string;
    let filename: string;

    if (contentType.includes("application/json")) {
      // === Blob 模式：前端已上傳到 Vercel Blob，這裡只收 metadata ===
      const body = await request.json();
      title = body.title;
      subject = body.subject || null;
      grade = body.grade || null;
      blobUrl = body.blobUrl;
      const ext = body.originalFilename
        ? "." + body.originalFilename.split(".").pop()
        : ".pdf";
      filename = `${id}${ext}`;

      if (!title || !blobUrl) {
        return NextResponse.json(
          { error: "請提供書籍標題和檔案" },
          { status: 400 }
        );
      }
    } else {
      // === FormData 模式（本地開發 fallback）===
      const formData = await request.formData();
      const file = formData.get("file") as File;
      title = formData.get("title") as string;
      subject = (formData.get("subject") as string) || null;
      grade = (formData.get("grade") as string) || null;

      if (!file || !title) {
        return NextResponse.json(
          { error: "請提供書籍標題和 PDF 檔案" },
          { status: 400 }
        );
      }

      const ext = file.name.split(".").pop() || "pdf";
      filename = `${id}.${ext}`;
      const bytes = await file.arrayBuffer();
      blobUrl = await uploadFile(filename, Buffer.from(bytes));
    }

    // 計算頁數
    const totalPages = await getPdfPageCount(blobUrl);

    // 存入資料庫
    const db = getDb();
    db.prepare(
      "INSERT INTO books (id, title, subject, grade, filename, blob_url, total_pages) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(id, title, subject, grade, filename, blobUrl, totalPages);

    return NextResponse.json({
      book: {
        id,
        title,
        subject,
        grade,
        filename,
        blob_url: blobUrl,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.error("上傳書籍失敗:", error);
    return NextResponse.json({ error: "上傳書籍失敗" }, { status: 500 });
  }
}
