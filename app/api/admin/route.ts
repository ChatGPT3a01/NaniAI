import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST: 驗證密碼
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const db = getDb();
    const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get() as { value: string } | undefined;
    const adminPassword = row?.value || "nani2026";

    if (password === adminPassword) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "密碼錯誤" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "驗證失敗" }, { status: 500 });
  }
}

// PUT: 修改密碼
export async function PUT(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "請填寫完整" }, { status: 400 });
    }
    if (newPassword.length < 4) {
      return NextResponse.json({ error: "新密碼至少需要 4 個字元" }, { status: 400 });
    }

    const db = getDb();
    const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get() as { value: string } | undefined;
    const adminPassword = row?.value || "nani2026";

    if (currentPassword !== adminPassword) {
      return NextResponse.json({ error: "目前密碼錯誤" }, { status: 401 });
    }

    db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_password'").run(newPassword);
    return NextResponse.json({ success: true, message: "密碼修改成功" });
  } catch {
    return NextResponse.json({ error: "修改密碼失敗" }, { status: 500 });
  }
}
