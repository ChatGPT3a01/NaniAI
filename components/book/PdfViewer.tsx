"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfViewerProps {
  fileUrl: string;
  totalPages: number;
  selectedPages: [number, number]; // [startPage, endPage]
  onSelectPages: (pages: [number, number]) => void;
}

export default function PdfViewer({
  fileUrl,
  totalPages,
  selectedPages,
  onSelectPages,
}: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [numPages, setNumPages] = useState(totalPages);
  const [selecting, setSelecting] = useState(false);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setNumPages(n);
    },
    []
  );

  function handlePageChange(delta: number) {
    setCurrentPage((prev) => Math.max(1, Math.min(numPages, prev + delta)));
  }

  function handleStartSelect() {
    setSelecting(true);
    onSelectPages([currentPage, currentPage]);
  }

  function handleEndSelect() {
    const end = Math.min(currentPage, selectedPages[0] + 2); // max 3 pages
    onSelectPages([selectedPages[0], end]);
    setSelecting(false);
  }

  function handleQuickSelect(start: number, end: number) {
    onSelectPages([start, Math.min(end, numPages)]);
    setCurrentPage(start);
  }

  const isPageInRange =
    currentPage >= selectedPages[0] && currentPage <= selectedPages[1];

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-gray-50 px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(-1)}
            disabled={currentPage <= 1}
            className="rounded p-1.5 hover:bg-gray-200 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[80px] text-center text-sm">
            第 {currentPage} / {numPages} 頁
          </span>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage >= numPages}
            className="rounded p-1.5 hover:bg-gray-200 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="rounded p-1.5 hover:bg-gray-200"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-muted">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            className="rounded p-1.5 hover:bg-gray-200"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Page selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-blue-50 px-4 py-2">
        <span className="text-xs font-medium text-blue-700">AI 分析範圍：</span>
        {selectedPages[0] > 0 ? (
          <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-white">
            第 {selectedPages[0]} ~ {selectedPages[1]} 頁
          </span>
        ) : (
          <span className="text-xs text-muted">尚未選取</span>
        )}

        {!selecting ? (
          <button
            onClick={handleStartSelect}
            className="rounded bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-hover"
          >
            從目前頁開始選取
          </button>
        ) : (
          <button
            onClick={handleEndSelect}
            className="rounded bg-accent px-3 py-1 text-xs font-medium text-white hover:opacity-90"
          >
            選取到此頁（最多 3 頁）
          </button>
        )}

        {/* Quick select buttons */}
        <div className="ml-auto flex gap-1">
          {[1, 2, 3].map((count) => (
            <button
              key={count}
              onClick={() =>
                handleQuickSelect(currentPage, currentPage + count - 1)
              }
              className="rounded border border-border bg-white px-2 py-1 text-xs text-foreground hover:bg-gray-100"
            >
              選 {count} 頁
            </button>
          ))}
        </div>
      </div>

      {/* PDF viewer */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="flex justify-center">
          <div
            className={cn(
              "rounded-lg bg-white shadow-lg ring-2",
              isPageInRange ? "ring-primary" : "ring-transparent"
            )}
          >
            <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
}
