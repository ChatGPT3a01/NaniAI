"use client";

import { useState } from "react";
import { Download, Loader2, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Difficulty = "basic" | "medium" | "advanced";

interface Question {
  number: number;
  type: string;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

interface Assessment {
  title: string;
  difficulty: string;
  questions: Question[];
}

interface Props {
  bookId: string;
  selectedPages: [number, number];
  bookFilename: string;
  bookFileUrl: string;
  getHeaders: () => Record<string, string>;
}

const DIFFICULTIES: { id: Difficulty; label: string; color: string }[] = [
  { id: "basic", label: "基礎", color: "bg-green-500" },
  { id: "medium", label: "中等", color: "bg-amber-500" },
  { id: "advanced", label: "進階", color: "bg-red-500" },
];

export default function AssessmentPanel({
  selectedPages,
  bookFileUrl,
  getHeaders,
}: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>("basic");
  const [generating, setGenerating] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    setAssessment(null);

    try {
      const headers = getHeaders();
      if (!headers["x-ai-api-key"]) {
        setError("請先到「API Key 設定」頁面設定您的 API Key");
        return;
      }

      const res = await fetch("/api/generate/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          fileUrl: bookFileUrl,
          startPage: selectedPages[0],
          endPage: selectedPages[1],
          difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAssessment(data.assessment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失敗");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!assessment) return;

    let content = `${assessment.title}\n`;
    content += `難度：${assessment.difficulty}\n`;
    content += `${"=".repeat(40)}\n\n`;

    assessment.questions.forEach((q) => {
      content += `${q.number}. ${q.question}\n`;
      if (q.options) {
        q.options.forEach((opt) => {
          content += `   ${opt}\n`;
        });
      }
      content += `\n`;
    });

    content += `\n${"=".repeat(40)}\n`;
    content += `答案與解析\n`;
    content += `${"=".repeat(40)}\n\n`;

    assessment.questions.forEach((q) => {
      content += `${q.number}. 答案：${q.answer}\n`;
      content += `   解析：${q.explanation}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${assessment.title || "評量試題"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground">差異化評量</h3>

      {/* Difficulty selector */}
      <div className="flex gap-2">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            onClick={() => setDifficulty(d.id)}
            className={cn(
              "flex-1 rounded-lg border-2 py-2 text-xs font-medium transition-all",
              difficulty === d.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted hover:border-gray-300"
            )}
          >
            <span className={cn("mr-1 inline-block h-2 w-2 rounded-full", d.color)} />
            {d.label}
          </button>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className={cn(
          "w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover",
          generating && "cursor-not-allowed opacity-60"
        )}
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            生成中...
          </span>
        ) : (
          "開始生成 10 題"
        )}
      </button>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</div>
      )}

      {/* Results */}
      {assessment && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{assessment.title}</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
              >
                {showAnswers ? "隱藏答案" : "顯示答案"}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs text-white hover:bg-primary-hover"
              >
                <Download size={12} />
                下載
              </button>
              <button
                onClick={handleGenerate}
                className="rounded bg-gray-100 p-1 text-muted hover:bg-gray-200"
                title="重新生成"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {assessment.questions.map((q) => (
            <div
              key={q.number}
              className="rounded-lg border border-border bg-white p-3 text-xs"
            >
              <p className="mb-2 font-medium">
                {q.number}. {q.question}
              </p>
              {q.options && (
                <div className="mb-2 space-y-1 pl-4">
                  {q.options.map((opt, i) => (
                    <p
                      key={i}
                      className={cn(
                        showAnswers &&
                          opt.startsWith(q.answer) &&
                          "font-medium text-green-600"
                      )}
                    >
                      {opt}
                    </p>
                  ))}
                </div>
              )}
              {showAnswers && (
                <div className="mt-2 rounded bg-blue-50 p-2 text-blue-700">
                  <p className="flex items-center gap-1 font-medium">
                    <CheckCircle size={12} />
                    答案：{q.answer}
                  </p>
                  <p className="mt-1 text-blue-600">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
