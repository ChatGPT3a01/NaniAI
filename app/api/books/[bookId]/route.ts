import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { deleteFile } from "@/lib/storage";

interface BookRow {
  id: string;
  filename: string;
  blob_url: string | null;
}

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
    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(bookId) as
      | BookRow
      | undefined;

    if (!book) {
      return NextResponse.json({ error: "找不到此書籍" }, { status: 404 });
    }

    // 刪除檔案：優先使用 blob_url，fallback 到 filename
    const fileRef = book.blob_url || book.filename;
    await deleteFile(fileRef);

    // 刪除資料庫記錄
    db.prepare("DELETE FROM books WHERE id = ?").run(bookId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("刪除書籍失敗:", error);
    return NextResponse.json({ error: "刪除書籍失敗" }, { status: 500 });
  }
}
