import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const subjects = db.prepare("SELECT id, name FROM subjects ORDER BY id").all();
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("取得科目失敗:", error);
    return NextResponse.json({ error: "取得科目失敗" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "請輸入科目名稱" }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM subjects WHERE name = ?").get(name.trim());
    if (existing) {
      return NextResponse.json({ error: "此科目已存在" }, { status: 400 });
    }

    const result = db.prepare("INSERT INTO subjects (name) VALUES (?)").run(name.trim());
    return NextResponse.json({ subject: { id: result.lastInsertRowid, name: name.trim() } });
  } catch (error) {
    console.error("新增科目失敗:", error);
    return NextResponse.json({ error: "新增科目失敗" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "缺少科目 ID" }, { status: 400 });
    }

    const db = getDb();
    db.prepare("DELETE FROM subjects WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("刪除科目失敗:", error);
    return NextResponse.json({ error: "刪除科目失敗" }, { status: 500 });
  }
}
