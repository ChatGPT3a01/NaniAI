import { NextRequest, NextResponse } from "next/server";
import { getApiConfig } from "@/lib/ai/provider";
import { callLLM } from "@/lib/ai";
import { extractTextFromPdf } from "@/lib/pdf-extract";
import {
  getWorksheetPrompt,
  WORKSHEET_SYSTEM_PROMPT,
} from "@/lib/prompts/worksheet";

export async function POST(request: NextRequest) {
  try {
    const config = getApiConfig(request.headers);
    const { filename, startPage, endPage } = await request.json();

    if (!filename || !startPage || !endPage) {
      return NextResponse.json({ error: "缺少必要參數" }, { status: 400 });
    }

    const text = await extractTextFromPdf(filename, startPage, endPage);
    if (!text.trim()) {
      return NextResponse.json(
        { error: "無法從選取頁面擷取文字" },
        { status: 400 }
      );
    }

    const prompt = getWorksheetPrompt(text);
    const result = await callLLM(config, prompt, WORKSHEET_SYSTEM_PROMPT);

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI 回應格式異常，請重試" },
        { status: 500 }
      );
    }

    const worksheet = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ worksheet });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成學習單失敗";
    console.error("生成學習單失敗:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
