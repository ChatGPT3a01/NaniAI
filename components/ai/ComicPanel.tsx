"use client";

import { useState } from "react";
import { Download, Loader2, RotateCcw, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComicPanelData {
  number: number;
  scene: string;
  dialogue: string;
  narration?: string;
  imageBase64?: string;
  imageGenerated?: boolean;
  imageNote?: string;
}

interface Comic {
  title: string;
  characters: { name: string; description: string }[];
  panels: ComicPanelData[];
}

interface Props {
  bookId: string;
  selectedPages: [number, number];
  bookFilename: string;
  bookFileUrl: string;
  getHeaders: () => Record<string, string>;
}

export default function ComicPanel({
  selectedPages,
  bookFileUrl,
  getHeaders,
}: Props) {
  const [generating, setGenerating] = useState(false);
  const [comic, setComic] = useState<Comic | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    setComic(null);

    try {
      const headers = getHeaders();
      if (!headers["x-ai-api-key"]) {
        setError("請先到「API Key 設定」頁面設定您的 API Key");
        return;
      }

      const res = await fetch("/api/generate/comic", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          fileUrl: bookFileUrl,
          startPage: selectedPages[0],
          endPage: selectedPages[1],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComic(data.comic);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失敗");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownloadImages() {
    if (!comic) return;
    // Download all images as individual files
    comic.panels.forEach((panel) => {
      if (panel.imageBase64) {
        const byteCharacters = atob(panel.imageBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${comic.title || "漫畫"}_第${panel.number}格.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  function handleDownloadScript() {
    if (!comic) return;

    let content = `${comic.title}\n\n`;
    content += `角色介紹：\n`;
    comic.characters.forEach((c) => {
      content += `  - ${c.name}：${c.description}\n`;
    });
    content += `\n${"─".repeat(30)}\n\n`;

    comic.panels.forEach((p) => {
      content += `【第 ${p.number} 格】\n`;
      content += `場景：${p.scene}\n`;
      content += `對話：${p.dialogue}\n`;
      if (p.narration) content += `旁白：${p.narration}\n`;
      content += `\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${comic.title || "知識漫畫"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasImages = comic?.panels.some((p) => p.imageBase64);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground">知識生成漫畫</h3>
      <p className="text-xs text-muted">
        根據課文內容，AI 生成 6~10 格漫畫（含腳本與圖片）
      </p>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className={cn(
          "w-full rounded-lg bg-purple-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-600",
          generating && "cursor-not-allowed opacity-60"
        )}
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            生成漫畫中（圖片需要較長時間）...
          </span>
        ) : (
          "生成漫畫"
        )}
      </button>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</div>
      )}

      {comic && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{comic.title}</h4>
            <div className="flex gap-2">
              {hasImages && (
                <button
                  onClick={handleDownloadImages}
                  className="flex items-center gap-1 rounded bg-purple-500 px-2 py-1 text-xs text-white hover:bg-purple-600"
                >
                  <Download size={12} />
                  下載圖片
                </button>
              )}
              <button
                onClick={handleDownloadScript}
                className="flex items-center gap-1 rounded border border-purple-300 px-2 py-1 text-xs text-purple-600 hover:bg-purple-50"
              >
                <Download size={12} />
                下載腳本
              </button>
              <button
                onClick={handleGenerate}
                className="rounded bg-gray-100 p-1 text-muted hover:bg-gray-200"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Characters */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="mb-1 text-xs font-semibold">角色介紹</p>
            <div className="flex flex-wrap gap-2">
              {comic.characters.map((c, i) => (
                <span
                  key={i}
                  className="rounded-full border border-border bg-white px-2 py-1 text-xs"
                >
                  {c.name}：{c.description}
                </span>
              ))}
            </div>
          </div>

          {/* Comic Panels */}
          <div className="grid grid-cols-2 gap-3">
            {comic.panels.map((panel) => (
              <div
                key={panel.number}
                className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm"
              >
                {/* Image */}
                {panel.imageBase64 ? (
                  <img
                    src={`data:image/png;base64,${panel.imageBase64}`}
                    alt={`第 ${panel.number} 格`}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                    <ImageIcon size={32} className="mb-2 text-purple-300" />
                    <p className="text-[10px] text-purple-400">
                      {panel.imageNote || "無圖片"}
                    </p>
                  </div>
                )}

                {/* Text overlay */}
                <div className="p-2.5">
                  <div className="mb-1 text-[10px] font-bold text-purple-500">
                    第 {panel.number} 格
                  </div>
                  <p className="text-xs font-medium leading-relaxed text-foreground">
                    💬 {panel.dialogue}
                  </p>
                  {panel.narration && (
                    <p className="mt-0.5 text-[10px] italic text-gray-500">
                      📝 {panel.narration}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
