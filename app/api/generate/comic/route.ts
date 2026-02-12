import { NextRequest, NextResponse } from "next/server";
import { getApiConfig } from "@/lib/ai/provider";
import { callLLM } from "@/lib/ai";
import { extractTextFromPdf } from "@/lib/pdf-extract";
import { getComicPrompt, COMIC_SYSTEM_PROMPT } from "@/lib/prompts/comic";
import OpenAI from "openai";

interface Panel {
  number: number;
  scene: string;
  dialogue: string;
  narration?: string;
  imageBase64?: string;
  imageGenerated?: boolean;
  imageNote?: string;
}

async function generateImageGoogle(
  apiKey: string,
  prompt: string
): Promise<string | null> {
  // Use Gemini's image generation via the REST API (Imagen 3)
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          safetyFilterLevel: "BLOCK_MEDIUM_AND_ABOVE",
        },
      }),
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const base64 = data?.predictions?.[0]?.bytesBase64Encoded;
  return base64 || null;
}

async function generateImageOpenAI(
  apiKey: string,
  prompt: string
): Promise<string | null> {
  const client = new OpenAI({ apiKey });
  const response = await client.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    response_format: "b64_json",
  });

  return response.data?.[0]?.b64_json || null;
}

export async function POST(request: NextRequest) {
  try {
    const config = getApiConfig(request.headers);
    const { fileUrl, filename, startPage, endPage } = await request.json();
    const pdfRef = fileUrl || filename;

    if (!pdfRef || !startPage || !endPage) {
      return NextResponse.json({ error: "缺少必要參數" }, { status: 400 });
    }

    const text = await extractTextFromPdf(pdfRef, startPage, endPage);
    if (!text.trim()) {
      return NextResponse.json(
        { error: "無法從選取頁面擷取文字" },
        { status: 400 }
      );
    }

    // Step 1: Generate comic script via LLM
    const prompt = getComicPrompt(text);
    const scriptResult = await callLLM(config, prompt, COMIC_SYSTEM_PROMPT);

    const jsonMatch = scriptResult.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI 回應格式異常，請重試" },
        { status: 500 }
      );
    }

    const comic = JSON.parse(jsonMatch[0]);

    // Step 2: Generate images for each panel
    const generateImage =
      config.provider === "google"
        ? generateImageGoogle
        : config.provider === "openai"
          ? generateImageOpenAI
          : null;

    if (generateImage) {
      const panelsWithImages: Panel[] = [];

      // Generate images sequentially to avoid rate limits
      for (const panel of comic.panels as Panel[]) {
        const imagePrompt = `Educational comic panel, colorful cartoon illustration style, child-friendly, no text in image: ${panel.scene}`;
        try {
          const base64 = await generateImage(config.apiKey, imagePrompt);
          panelsWithImages.push({
            ...panel,
            imageBase64: base64 || undefined,
            imageGenerated: !!base64,
            imageNote: base64 ? "圖片已生成" : "圖片生成失敗",
          });
        } catch {
          panelsWithImages.push({
            ...panel,
            imageGenerated: false,
            imageNote: "圖片生成失敗",
          });
        }
      }

      comic.panels = panelsWithImages;
    } else {
      // Groq doesn't support image generation
      comic.panels = (comic.panels as Panel[]).map((p) => ({
        ...p,
        imageGenerated: false,
        imageNote: "Groq 不支援圖片生成，僅顯示腳本",
      }));
    }

    return NextResponse.json({ comic });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成漫畫失敗";
    console.error("生成漫畫失敗:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
