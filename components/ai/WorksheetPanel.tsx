"use client";

import { useState } from "react";
import { Download, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorksheetQuestion {
  number: number;
  question: string;
  hint?: string;
  lines?: number;
}

interface WorksheetSection {
  title: string;
  type: string;
  content: string;
  questions: WorksheetQuestion[];
}

interface Worksheet {
  title: string;
  topic: string;
  objectives: string[];
  sections: WorksheetSection[];
  reflection: { title: string; questions: string[] };
  extension: { title: string; description: string };
}

interface Props {
  bookId: string;
  selectedPages: [number, number];
  bookFilename: string;
  getHeaders: () => Record<string, string>;
}

export default function WorksheetPanel({
  selectedPages,
  bookFilename,
  getHeaders,
}: Props) {
  const [generating, setGenerating] = useState(false);
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    setWorksheet(null);

    try {
      const headers = getHeaders();
      if (!headers["x-ai-api-key"]) {
        setError("請先到「API Key 設定」頁面設定您的 API Key");
        return;
      }

      const res = await fetch("/api/generate/worksheet", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          filename: bookFilename,
          startPage: selectedPages[0],
          endPage: selectedPages[1],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWorksheet(data.worksheet);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失敗");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!worksheet) return;

    let content = `${worksheet.title}\n`;
    content += `主題：${worksheet.topic}\n\n`;
    content += `學習目標：\n`;
    worksheet.objectives.forEach((obj, i) => {
      content += `${i + 1}. ${obj}\n`;
    });
    content += `\n${"═".repeat(40)}\n\n`;

    worksheet.sections.forEach((section) => {
      content += `▎${section.title}\n`;
      content += `${section.content}\n\n`;
      section.questions.forEach((q) => {
        content += `${q.number}. ${q.question}\n`;
        if (q.hint) content += `   💡 提示：${q.hint}\n`;
        content += `   ${"_".repeat(30)}\n\n`;
      });
    });

    if (worksheet.reflection) {
      content += `\n▎${worksheet.reflection.title}\n`;
      worksheet.reflection.questions.forEach((q, i) => {
        content += `${i + 1}. ${q}\n   ${"_".repeat(30)}\n\n`;
      });
    }

    if (worksheet.extension) {
      content += `\n▎${worksheet.extension.title}\n`;
      content += `${worksheet.extension.description}\n`;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${worksheet.title || "素養學習單"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground">素養學習單</h3>
      <p className="text-xs text-muted">
        生成素養導向的主題學習單，包含情境題、探究活動與反思
      </p>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className={cn(
          "w-full rounded-lg bg-green-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600",
          generating && "cursor-not-allowed opacity-60"
        )}
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            生成中...
          </span>
        ) : (
          "生成學習單"
        )}
      </button>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</div>
      )}

      {worksheet && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{worksheet.title}</h4>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
              >
                <Download size={12} />
                下載
              </button>
              <button
                onClick={handleGenerate}
                className="rounded bg-gray-100 p-1 text-muted hover:bg-gray-200"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Topic & Objectives */}
          <div className="rounded-lg bg-green-50 p-3">
            <p className="mb-1 text-xs font-semibold text-green-800">
              {worksheet.topic}
            </p>
            <ul className="space-y-0.5">
              {worksheet.objectives.map((obj, i) => (
                <li key={i} className="text-[10px] text-green-700">
                  ✓ {obj}
                </li>
              ))}
            </ul>
          </div>

          {/* Sections */}
          {worksheet.sections.map((section, si) => (
            <div
              key={si}
              className="rounded-lg border border-border bg-white p-3"
            >
              <h5 className="mb-2 text-xs font-bold text-foreground">
                {section.title}
              </h5>
              <p className="mb-2 text-xs text-muted leading-relaxed">
                {section.content}
              </p>
              <div className="space-y-2">
                {section.questions.map((q) => (
                  <div key={q.number} className="rounded bg-gray-50 p-2">
                    <p className="text-xs font-medium">
                      {q.number}. {q.question}
                    </p>
                    {q.hint && (
                      <p className="mt-0.5 text-[10px] text-amber-600">
                        💡 {q.hint}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Reflection */}
          {worksheet.reflection && (
            <div className="rounded-lg border-2 border-dashed border-amber-200 bg-amber-50 p-3">
              <h5 className="mb-2 text-xs font-bold text-amber-800">
                {worksheet.reflection.title}
              </h5>
              {worksheet.reflection.questions.map((q, i) => (
                <p key={i} className="text-xs text-amber-700">
                  {i + 1}. {q}
                </p>
              ))}
            </div>
          )}

          {/* Extension */}
          {worksheet.extension && (
            <div className="rounded-lg bg-purple-50 p-3">
              <h5 className="mb-1 text-xs font-bold text-purple-800">
                {worksheet.extension.title}
              </h5>
              <p className="text-xs text-purple-700">
                {worksheet.extension.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
