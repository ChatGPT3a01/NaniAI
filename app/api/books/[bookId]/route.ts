import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const db = getDb();
    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(bookId);

    if (!book) {
      return NextResponse.json({ error: "找不到此書籍" }, { status: 404 });
    }

    return NextResponse.json({ book });
  } catch (error) {
    console.error("取得書籍資訊失敗:", error);
    return NextResponse.json({ error: "取得書籍資訊失敗" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const db = getDb();
    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(bookId) as {
      filename: string;
    } | undefined;

    if (!book) {
      return NextResponse.json({ error: "找不到此書籍" }, { status: 404 });
    }

    // Delete file
    const filePath = path.join(UPLOADS_DIR, book.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.prepare("DELETE FROM books WHERE id = ?").run(bookId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("刪除書籍失敗:", error);
    return NextResponse.json({ error: "刪除書籍失敗" }, { status: 500 });
  }
}
