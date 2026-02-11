"use client";

import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Upload,
  BookOpen,
  MousePointerClick,
  Sparkles,
  Download,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "歡迎使用南一 AI 教學助手",
    icon: Sparkles,
    color: "bg-primary",
    content:
      "這是一個 AI 驅動的教學輔助平台，能幫助老師快速將教科書內容轉化為多元教學素材。",
    details: [
      "自動生成差異化評量試題",
      "將課本知識轉化為趣味漫畫",
      "產出素養導向學習單",
      "製作科普 Podcast 音檔",
    ],
    image: null,
  },
  {
    title: "步驟一：設定 API Key",
    icon: Settings,
    color: "bg-amber-500",
    content:
      '點擊右上角的「API Key 設定」，選擇您要使用的 AI 服務並輸入 API Key。',
    details: [
      "支援 Google Gemini、OpenAI、Groq（免費）三種服務",
      "選擇服務後，挑選適合的模型",
      "輸入您的 API Key 並按「儲存設定」",
      "可按「驗證 API Key」確認設定正確",
      "API Key 僅存在您的瀏覽器中，安全無虞",
    ],
    tip: "推薦使用 Gemini 2.5 Flash，速度快且成本低！如果想免費試用，可選 Groq。",
  },
  {
    title: "步驟二：上傳教科書（管理員）",
    icon: Upload,
    color: "bg-green-500",
    content: '點擊「資源管理」進入管理頁面，需先輸入管理員密碼才能操作。',
    details: [
      "進入資源管理需輸入管理員密碼（預設為 nani2026）",
      "填寫書籍名稱（必填）",
      "選擇科目 — 按「管理」可自訂新增或刪除科目",
      "選擇年級（選填，方便分類）",
      "選擇 PDF 檔案並上傳，系統會自動計算總頁數",
      "頁面下方可修改管理員密碼",
    ],
    tip: "PDF 檔案需包含可選取的文字內容，掃描圖片版的 PDF 可能無法擷取文字。",
  },
  {
    title: "步驟三：瀏覽與選取頁面",
    icon: BookOpen,
    color: "bg-blue-500",
    content: "回到首頁，點選已上傳的書籍進入瀏覽頁面。",
    details: [
      "左側為 PDF 瀏覽區，可翻頁、縮放",
      "使用「從目前頁開始選取」按鈕設定起始頁",
      "再按「選取到此頁」完成範圍設定",
      "或直接用「選 1 頁 / 選 2 頁 / 選 3 頁」快速選取",
      "選取範圍上限為 3 頁",
    ],
    tip: "選取的頁面會以藍色邊框標示，上方也會顯示目前選取的範圍。",
  },
  {
    title: "步驟四：使用 AI 功能",
    icon: MousePointerClick,
    color: "bg-purple-500",
    content: "選取頁面後，右側四大 AI 功能按鈕會啟用，點擊即可使用。",
    details: [
      "【差異化評量】選擇難度（基礎/中等/進階），生成 10 題試題",
      "【知識生成漫畫】自動生成 6~10 格漫畫，含 AI 繪製圖片與對話腳本",
      "【素養學習單】生成包含情境題、探究活動的學習單",
      "【Podcast 學習助教】生成約 5 分鐘的科普講稿，可同時生成語音（支援 Google 及 OpenAI）",
    ],
    tip: "生成過程需要 10~60 秒（漫畫圖片較久），請耐心等待。每次生成會使用您的 API 額度。",
  },
  {
    title: "步驟五：預覽與下載",
    icon: Download,
    color: "bg-orange-500",
    content: "AI 生成完畢後，可直接在頁面預覽結果，並下載保存。",
    details: [
      "評量試題：可切換顯示/隱藏答案，下載為文字檔",
      "漫畫：預覽 AI 生成的圖片與對話，可下載圖片或腳本",
      "學習單：完整預覽所有段落，下載為文字檔",
      "Podcast：可線上播放音檔，下載 MP3 或講稿",
      "每個功能都有「重新生成」按鈕，不滿意可重試",
    ],
    tip: "下載的檔案可進一步在 Word 或其他軟體中編輯排版。",
  },
];

export default function TutorialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setCurrentStep(0);
        }}
        className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
      >
        <HelpCircle size={16} />
        使用教學
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            {/* Step indicator */}
            <div className="flex gap-1 px-6 pt-5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all",
                    i === currentStep ? "bg-primary" : i < currentStep ? "bg-primary/40" : "bg-gray-200"
                  )}
                />
              ))}
            </div>

            {/* Content */}
            <div className="px-6 pb-2 pt-4">
              {/* Header */}
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white",
                    step.color
                  )}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-xs text-muted">
                    {currentStep === 0
                      ? "教學導覽"
                      : `第 ${currentStep} 步，共 ${STEPS.length - 1} 步`}
                  </p>
                  <h2 className="text-base font-bold text-foreground">
                    {step.title}
                  </h2>
                </div>
              </div>

              {/* Description */}
              <p className="mb-3 text-sm leading-relaxed text-gray-700">
                {step.content}
              </p>

              {/* Details list */}
              {step.details && (
                <ul className="mb-3 space-y-1.5">
                  {step.details.map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
              )}

              {/* Tip */}
              {"tip" in step && step.tip && (
                <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                  <span className="font-semibold">小提示：</span> {step.tip}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                disabled={isFirst}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isFirst
                    ? "invisible"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <ChevronLeft size={16} />
                上一步
              </button>

              {isLast ? (
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover"
                >
                  開始使用！
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
                >
                  {isFirst ? "開始教學" : "下一步"}
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
