"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PdfViewer from "@/components/book/PdfViewer";
import AiToolbar from "@/components/ai/AiToolbar";

interface Book {
  id: string;
  title: string;
  subject: string;
  grade: string;
  filename: string;
  blob_url: string | null;
  total_pages: number;
}

export default function BookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPages, setSelectedPages] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${bookId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setBook(data.book);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [bookId, router]);

  if (loading || !book) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-6 flex h-[calc(100vh-4rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-border bg-white px-4 py-2">
        <button
          onClick={() => router.push("/")}
          className="rounded-lg p-1.5 hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-sm font-bold text-foreground">{book.title}</h1>
          <p className="text-xs text-muted">
            {[book.subject, book.grade, `${book.total_pages} 頁`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      {/* Main content: PDF viewer (left) + AI toolbar (right) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: PDF Viewer */}
        <div className="flex-1 border-r border-border">
          <PdfViewer
            fileUrl={book.blob_url || `/uploads/${book.filename}`}
            totalPages={book.total_pages}
            selectedPages={selectedPages}
            onSelectPages={setSelectedPages}
          />
        </div>

        {/* Right: AI Toolbar */}
        <div className="w-[420px] shrink-0 overflow-hidden bg-gray-50">
          <AiToolbar
            bookId={book.id}
            selectedPages={selectedPages}
            bookFilename={book.filename}
            bookFileUrl={book.blob_url || `/uploads/${book.filename}`}
          />
        </div>
      </div>
    </div>
  );
}
