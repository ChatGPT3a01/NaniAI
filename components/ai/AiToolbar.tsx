"use client";

import { useState } from "react";
import {
  ClipboardList,
  Image,
  FileText,
  Headphones,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AssessmentPanel from "./AssessmentPanel";
import ComicPanel from "./ComicPanel";
import WorksheetPanel from "./WorksheetPanel";
import PodcastPanel from "./PodcastPanel";

type Tool = "assessment" | "comic" | "worksheet" | "podcast";

const tools: { id: Tool; label: string; icon: typeof ClipboardList; color: string }[] = [
  { id: "assessment", label: "差異化評量", icon: ClipboardList, color: "bg-blue-500" },
  { id: "comic", label: "知識生成漫畫", icon: Image, color: "bg-purple-500" },
  { id: "worksheet", label: "素養學習單", icon: FileText, color: "bg-green-500" },
  { id: "podcast", label: "PODCAST 學習助教", icon: Headphones, color: "bg-orange-500" },
];

interface AiToolbarProps {
  bookId: string;
  selectedPages: [number, number];
  bookFilename: string;
  bookFileUrl: string;
}

export default function AiToolbar({
  bookId,
  selectedPages,
  bookFilename,
  bookFileUrl,
}: AiToolbarProps) {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const hasSelection = selectedPages[0] > 0;

  function getAiHeaders(): Record<string, string> {
    const provider = localStorage.getItem("ai_provider") || "";
    const apiKey = localStorage.getItem("ai_api_key") || "";
    const model = localStorage.getItem("ai_model") || "";
    return {
      "x-ai-provider": provider,
      "x-ai-api-key": apiKey,
      "x-ai-model": model,
    };
  }

  return (
    <div className="flex h-full flex-col">
      {/* Tool buttons */}
      <div className="grid grid-cols-2 gap-3 border-b border-border p-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(isActive ? null : tool.id)}
              disabled={!hasSelection}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
                isActive
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-white hover:border-gray-300 hover:shadow-sm",
                !hasSelection && "cursor-not-allowed opacity-40"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg text-white",
                  tool.color
                )}
              >
                <Icon size={20} />
              </div>
              <span className="text-xs font-medium">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Warning if no selection */}
      {!hasSelection && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          <AlertCircle size={14} />
          請先在左側 PDF 中選取頁面範圍
        </div>
      )}

      {/* Active panel */}
      <div className="flex-1 overflow-auto p-4">
        {activeTool === "assessment" && (
          <AssessmentPanel
            bookId={bookId}
            selectedPages={selectedPages}
            bookFilename={bookFilename}
            bookFileUrl={bookFileUrl}
            getHeaders={getAiHeaders}
          />
        )}
        {activeTool === "comic" && (
          <ComicPanel
            bookId={bookId}
            selectedPages={selectedPages}
            bookFilename={bookFilename}
            bookFileUrl={bookFileUrl}
            getHeaders={getAiHeaders}
          />
        )}
        {activeTool === "worksheet" && (
          <WorksheetPanel
            bookId={bookId}
            selectedPages={selectedPages}
            bookFilename={bookFilename}
            bookFileUrl={bookFileUrl}
            getHeaders={getAiHeaders}
          />
        )}
        {activeTool === "podcast" && (
          <PodcastPanel
            bookId={bookId}
            selectedPages={selectedPages}
            bookFilename={bookFilename}
            bookFileUrl={bookFileUrl}
            getHeaders={getAiHeaders}
          />
        )}
      </div>
    </div>
  );
}
