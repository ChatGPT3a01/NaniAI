"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import BannerCarousel from "@/components/layout/BannerCarousel";

interface Book {
  id: string;
  title: string;
  subject: string;
  grade: string;
  filename: string;
  total_pages: number;
  created_at: string;
}

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      setBooks(data.books || []);
    } catch {
      console.error("無法載入書籍列表");
    } finally {
      setLoading(false);
    }
  }

  async function deleteBook(id: string) {
    if (!confirm("確定要刪除此書籍？")) return;
    try {
      await fetch(`/api/books/${id}`, { method: "DELETE" });
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("刪除失敗");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 南一書局廣告輪播 */}
      <BannerCarousel />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">教科書列表</h1>
          <p className="mt-1 text-sm text-muted">
            選擇一本教科書開始使用 AI 輔助功能
          </p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <Plus size={16} />
          上傳新書籍
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-white p-8 text-center">
          <BookOpen size={48} className="mb-4 text-muted" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            尚無教科書
          </h2>
          <p className="mb-4 text-sm text-muted">
            請先到資源管理上傳教科書 PDF 檔案
          </p>
          <Link
            href="/admin"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            前往上傳
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div
              key={book.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <button
                onClick={() => deleteBook(book.id)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-muted opacity-0 transition-all hover:bg-red-50 hover:text-danger group-hover:opacity-100"
                title="刪除書籍"
              >
                <Trash2 size={16} />
              </button>
              <Link href={`/book/${book.id}`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen size={24} className="text-primary" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                  {book.title}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs text-muted">
                  {book.subject && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-600">
                      {book.subject}
                    </span>
                  )}
                  {book.grade && (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-600">
                      {book.grade}
                    </span>
                  )}
                  <span className="rounded-full bg-gray-50 px-2 py-0.5 text-gray-600">
                    {book.total_pages} 頁
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
