import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { getPdfPageCount } from "@/lib/pdf-extract";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

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
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const subject = formData.get("subject") as string;
    const grade = formData.get("grade") as string;

    if (!file || !title) {
      return NextResponse.json({ error: "請提供書籍標題和 PDF 檔案" }, { status: 400 });
    }

    // Ensure uploads directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    // Save file
    const id = generateId();
    const ext = path.extname(file.name);
    const filename = `${id}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    // Get page count
    const totalPages = await getPdfPageCount(filename);

    // Insert into database
    const db = getDb();
    db.prepare(
      "INSERT INTO books (id, title, subject, grade, filename, total_pages) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, title, subject || null, grade || null, filename, totalPages);

    return NextResponse.json({
      book: { id, title, subject, grade, filename, total_pages: totalPages },
    });
  } catch (error) {
    console.error("上傳書籍失敗:", error);
    return NextResponse.json({ error: "上傳書籍失敗" }, { status: 500 });
  }
}
