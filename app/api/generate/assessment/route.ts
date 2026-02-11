import { NextRequest, NextResponse } from "next/server";
import { getApiConfig } from "@/lib/ai/provider";
import { callLLM } from "@/lib/ai";
import { extractTextFromPdf } from "@/lib/pdf-extract";
import {
  getAssessmentPrompt,
  ASSESSMENT_SYSTEM_PROMPT,
  Difficulty,
} from "@/lib/prompts/assessment";

export async function POST(request: NextRequest) {
  try {
    const config = getApiConfig(request.headers);
    const { filename, startPage, endPage, difficulty } = await request.json();

    if (!filename || !startPage || !endPage || !difficulty) {
      return NextResponse.json({ error: "缺少必要參數" }, { status: 400 });
    }

    // Extract text from PDF
    const text = await extractTextFromPdf(filename, startPage, endPage);
    if (!text.trim()) {
      return NextResponse.json(
        { error: "無法從選取頁面擷取文字，請確認 PDF 包含文字內容" },
        { status: 400 }
      );
    }

    // Generate assessment
    const prompt = getAssessmentPrompt(text, difficulty as Difficulty);
    const result = await callLLM(config, prompt, ASSESSMENT_SYSTEM_PROMPT);

    // Parse JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI 回應格式異常，請重試" },
        { status: 500 }
      );
    }

    const assessment = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ assessment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成評量失敗";
    console.error("生成評量失敗:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
