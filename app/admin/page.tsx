"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Lock,
  LogOut,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectItem {
  id: number;
  name: string;
}

const GRADES = [
  "一年級", "二年級", "三年級", "四年級", "五年級", "六年級",
  "七年級", "八年級", "九年級",
  "高一", "高二", "高三",
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Subjects
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [showSubjectInput, setShowSubjectInput] = useState(false);

  // Change password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_auth");
    if (saved === "true") setIsAuthenticated(true);
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      setSubjects(data.subjects || []);
    } catch {
      // ignore
    }
  }

  async function handleAddSubject() {
    if (!newSubject.trim()) return;
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubject.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubjects((prev) => [...prev, data.subject]);
        setNewSubject("");
        setShowSubjectInput(false);
      } else {
        const err = await res.json();
        alert(err.error || "新增失敗");
      }
    } catch {
      alert("新增失敗");
    }
  }

  async function handleDeleteSubject(id: number) {
    if (!confirm("確定要刪除此科目？")) return;
    try {
      const res = await fetch("/api/subjects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSubjects((prev) => prev.filter((s) => s.id !== id));
        if (subject && subjects.find((s) => s.id === id)?.name === subject) {
          setSubject("");
        }
      }
    } catch {
      alert("刪除失敗");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_auth", "true");
      } else {
        setAuthError("密碼錯誤，請重新輸入");
      }
    } catch {
      setAuthError("驗證失敗，請稍後再試");
    }
  }

  function handleLogout() {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_auth");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMessage(null);

    if (!currentPw || !newPw || !confirmPw) {
      setPwMessage({ type: "error", text: "請填寫所有欄位" });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMessage({ type: "error", text: "新密碼與確認密碼不一致" });
      return;
    }
    if (newPw.length < 4) {
      setPwMessage({ type: "error", text: "新密碼至少需要 4 個字元" });
      return;
    }

    setChangingPw(true);
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMessage({ type: "success", text: "密碼修改成功！" });
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        setPwMessage({ type: "error", text: data.error || "修改失敗" });
      }
    } catch {
      setPwMessage({ type: "error", text: "修改失敗，請稍後再試" });
    } finally {
      setChangingPw(false);
    }
  }

  // --- Password gate ---
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-sm pt-20">
        <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Lock size={28} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">資源管理登入</h1>
            <p className="mt-1 text-sm text-muted">請輸入管理員密碼</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入管理員密碼"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-center text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            {authError && (
              <p className="text-center text-xs text-danger">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              登入
            </button>
          </form>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title) {
      setMessage({ type: "error", text: "請填寫書籍名稱並選擇 PDF 檔案" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("grade", grade);

      const res = await fetch("/api/books", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "上傳失敗");
      }

      setMessage({ type: "success", text: "教科書上傳成功！" });
      setTitle("");
      setSubject("");
      setGrade("");
      setFile(null);

      const fileInput = document.getElementById("pdf-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "上傳失敗",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">資源管理</h1>
          <p className="mt-1 text-sm text-muted">上傳教科書 PDF 檔案</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted hover:bg-gray-100 hover:text-foreground"
        >
          <LogOut size={14} />
          登出管理
        </button>
      </div>

      {/* 上傳教科書表單 */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            書籍名稱 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：自然科學 第一冊"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            科目
          </label>
          <div className="flex gap-2">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">請選擇科目</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowSubjectInput(!showSubjectInput)}
              className="flex items-center gap-1 rounded-lg border border-border px-3 text-sm text-muted hover:bg-gray-50 hover:text-foreground"
              title="管理科目"
            >
              <Plus size={14} />
              管理
            </button>
          </div>

          {/* 管理科目面板 */}
          {showSubjectInput && (
            <div className="mt-3 rounded-lg border border-border bg-gray-50 p-3">
              <p className="mb-2 text-xs font-medium text-foreground">科目管理</p>
              {/* 現有科目列表 */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {subjects.map((s) => (
                  <span
                    key={s.id}
                    className="flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-xs"
                  >
                    {s.name}
                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(s.id)}
                      className="rounded-full p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              {/* 新增科目 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="輸入新科目名稱"
                  className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSubject())}
                />
                <button
                  type="button"
                  onClick={handleAddSubject}
                  disabled={!newSubject.trim()}
                  className={cn(
                    "rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover",
                    !newSubject.trim() && "cursor-not-allowed opacity-50"
                  )}
                >
                  新增
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            年級
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">請選擇年級</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            PDF 檔案 <span className="text-danger">*</span>
          </label>
          <div
            className={cn(
              "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
              file ? "border-primary bg-primary/5" : "border-border hover:border-muted"
            )}
          >
            <Upload size={32} className={cn("mb-3", file ? "text-primary" : "text-muted")} />
            <p className="mb-1 text-sm font-medium text-foreground">
              {file ? file.name : "點擊或拖拉上傳 PDF 檔案"}
            </p>
            <p className="text-xs text-muted">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "僅支援 PDF 格式"}
            </p>
            <input
              id="pdf-file"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 cursor-pointer opacity-0"
              required
            />
          </div>
        </div>

        {message && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg p-3 text-sm",
              message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}
          >
            {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className={cn(
            "w-full rounded-lg bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover",
            uploading && "cursor-not-allowed opacity-60"
          )}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              上傳中...
            </span>
          ) : (
            "上傳教科書"
          )}
        </button>
      </form>

      {/* 修改密碼區塊 */}
      <div className="mt-6 rounded-xl border border-border bg-white shadow-sm">
        <button
          onClick={() => setShowChangePassword(!showChangePassword)}
          className="flex w-full items-center justify-between px-6 py-4 text-left"
        >
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-muted" />
            <span className="text-sm font-medium text-foreground">修改管理員密碼</span>
          </div>
          {showChangePassword ? (
            <ChevronUp size={16} className="text-muted" />
          ) : (
            <ChevronDown size={16} className="text-muted" />
          )}
        </button>

        {showChangePassword && (
          <form onSubmit={handleChangePassword} className="space-y-4 border-t border-border px-6 py-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                目前密碼
              </label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="輸入目前的管理員密碼"
                className="w-full rounded-lg border border-border px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                新密碼
              </label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="輸入新密碼（至少 4 個字元）"
                className="w-full rounded-lg border border-border px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                確認新密碼
              </label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="再次輸入新密碼"
                className="w-full rounded-lg border border-border px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {pwMessage && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg p-3 text-xs",
                  pwMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                )}
              >
                {pwMessage.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {pwMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={changingPw}
              className={cn(
                "w-full rounded-lg bg-amber-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600",
                changingPw && "cursor-not-allowed opacity-60"
              )}
            >
              {changingPw ? "修改中..." : "確認修改密碼"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
