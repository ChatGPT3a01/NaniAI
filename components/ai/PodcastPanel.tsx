"use client";

import { useState } from "react";
import { Download, Loader2, RotateCcw, Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PodcastSegment {
  type: string;
  subtitle?: string;
  text: string;
  duration: string;
}

interface Podcast {
  title: string;
  duration_estimate: string;
  segments: PodcastSegment[];
  full_script: string;
  audioBase64?: string;
  audioGenerated?: boolean;
  audioError?: string;
}

interface Props {
  bookId: string;
  selectedPages: [number, number];
  bookFilename: string;
  getHeaders: () => Record<string, string>;
}

const SEGMENT_ICONS: Record<string, string> = {
  intro: "🎙️",
  main: "📚",
  example: "💡",
  summary: "📝",
  outro: "👋",
};

export default function PodcastPanel({
  selectedPages,
  bookFilename,
  getHeaders,
}: Props) {
  const [generating, setGenerating] = useState(false);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [error, setError] = useState("");
  const [generateAudio, setGenerateAudio] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    setPodcast(null);
    setIsPlaying(false);

    try {
      const headers = getHeaders();
      if (!headers["x-ai-api-key"]) {
        setError("請先到「API Key 設定」頁面設定您的 API Key");
        return;
      }

      const res = await fetch("/api/generate/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          filename: bookFilename,
          startPage: selectedPages[0],
          endPage: selectedPages[1],
          generateAudio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPodcast(data.podcast);

      // Create audio element if audio was generated
      if (data.podcast.audioBase64) {
        const audio = new Audio(
          `data:audio/mp3;base64,${data.podcast.audioBase64}`
        );
        audio.onended = () => setIsPlaying(false);
        setAudioElement(audio);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失敗");
    } finally {
      setGenerating(false);
    }
  }

  function togglePlay() {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  }

  function handleDownloadAudio() {
    if (!podcast?.audioBase64) return;
    const byteCharacters = atob(podcast.audioBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "audio/mp3" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${podcast.title || "Podcast"}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadScript() {
    if (!podcast) return;

    let content = `🎙️ ${podcast.title}\n`;
    content += `預估時長：${podcast.duration_estimate}\n\n`;
    content += `${"═".repeat(40)}\n\n`;

    podcast.segments.forEach((seg) => {
      const icon = SEGMENT_ICONS[seg.type] || "📌";
      content += `${icon} ${seg.subtitle || seg.type.toUpperCase()} (${seg.duration})\n`;
      content += `${seg.text}\n\n`;
    });

    content += `\n${"═".repeat(40)}\n`;
    content += `完整講稿\n`;
    content += `${"═".repeat(40)}\n\n`;
    content += podcast.full_script;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${podcast.title || "Podcast 講稿"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground">PODCAST 學習助教</h3>
      <p className="text-xs text-muted">
        生成約 5 分鐘的科普解說講稿，可選擇同時生成語音
      </p>

      {/* Options */}
      <label className="flex items-center gap-2 rounded-lg border border-border bg-white p-3 text-xs">
        <input
          type="checkbox"
          checked={generateAudio}
          onChange={(e) => setGenerateAudio(e.target.checked)}
          className="rounded"
        />
        <Volume2 size={14} className="text-orange-500" />
        <span>同時生成語音（需要 Google Cloud TTS API 權限）</span>
      </label>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className={cn(
          "w-full rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600",
          generating && "cursor-not-allowed opacity-60"
        )}
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            生成中（可能需要 30 秒）...
          </span>
        ) : (
          "生成 Podcast"
        )}
      </button>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</div>
      )}

      {podcast && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{podcast.title}</h4>
            <button
              onClick={handleGenerate}
              className="rounded bg-gray-100 p-1 text-muted hover:bg-gray-200"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Audio player */}
          {podcast.audioBase64 && (
            <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-3">
              <button
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <div className="flex-1">
                <p className="text-xs font-medium text-orange-800">
                  {podcast.title}
                </p>
                <p className="text-[10px] text-orange-600">
                  {podcast.duration_estimate}
                </p>
              </div>
              <button
                onClick={handleDownloadAudio}
                className="flex items-center gap-1 rounded bg-orange-500 px-2 py-1 text-xs text-white hover:bg-orange-600"
              >
                <Download size={12} />
                MP3
              </button>
            </div>
          )}

          {podcast.audioError && (
            <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
              ⚠️ {podcast.audioError}
            </div>
          )}

          {/* Download script */}
          <button
            onClick={handleDownloadScript}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-orange-300 py-2 text-xs font-medium text-orange-600 hover:bg-orange-50"
          >
            <Download size={12} />
            下載講稿文字檔
          </button>

          {/* Segments */}
          <div className="space-y-2">
            {podcast.segments.map((seg, i) => {
              const icon = SEGMENT_ICONS[seg.type] || "📌";
              return (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-white p-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-semibold">
                      {icon} {seg.subtitle || seg.type}
                    </span>
                    <span className="text-[10px] text-muted">{seg.duration}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-700">
                    {seg.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
