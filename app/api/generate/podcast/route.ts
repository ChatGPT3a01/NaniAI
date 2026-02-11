import { NextRequest, NextResponse } from "next/server";
import { getApiConfig } from "@/lib/ai/provider";
import { callLLM } from "@/lib/ai";
import { extractTextFromPdf } from "@/lib/pdf-extract";
import { getPodcastPrompt, PODCAST_SYSTEM_PROMPT } from "@/lib/prompts/podcast";
import OpenAI from "openai";

async function generateAudioGoogle(
  apiKey: string,
  script: string
): Promise<string | null> {
  const ttsResponse = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text: script },
        voice: {
          languageCode: "cmn-TW",
          name: "cmn-TW-Wavenet-A",
          ssmlGender: "FEMALE",
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.95,
          pitch: 0,
        },
      }),
    }
  );

  if (!ttsResponse.ok) return null;
  const ttsData = await ttsResponse.json();
  return ttsData.audioContent || null;
}

async function generateAudioOpenAI(
  apiKey: string,
  script: string
): Promise<string | null> {
  const client = new OpenAI({ apiKey });

  // OpenAI TTS has a 4096 char limit per request, so we may need to split
  const chunks: string[] = [];
  const maxChars = 4000;

  if (script.length <= maxChars) {
    chunks.push(script);
  } else {
    // Split by sentences
    const sentences = script.split(/(?<=[。！？\n])/);
    let current = "";
    for (const sentence of sentences) {
      if (current.length + sentence.length > maxChars) {
        if (current) chunks.push(current);
        current = sentence;
      } else {
        current += sentence;
      }
    }
    if (current) chunks.push(current);
  }

  // Generate audio for each chunk
  const audioBuffers: Buffer[] = [];
  for (const chunk of chunks) {
    const response = await client.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: chunk,
      response_format: "mp3",
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    audioBuffers.push(buffer);
  }

  // Concatenate all audio buffers
  const combined = Buffer.concat(audioBuffers);
  return combined.toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const config = getApiConfig(request.headers);
    const { filename, startPage, endPage, generateAudio } = await request.json();

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

    // Step 1: Generate podcast script
    const prompt = getPodcastPrompt(text);
    const result = await callLLM(config, prompt, PODCAST_SYSTEM_PROMPT);

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI 回應格式異常，請重試" },
        { status: 500 }
      );
    }

    const podcast = JSON.parse(jsonMatch[0]);

    // Step 2: Generate audio (if requested)
    if (generateAudio && podcast.full_script) {
      try {
        let audioBase64: string | null = null;

        if (config.provider === "google") {
          audioBase64 = await generateAudioGoogle(config.apiKey, podcast.full_script);
        } else if (config.provider === "openai") {
          audioBase64 = await generateAudioOpenAI(config.apiKey, podcast.full_script);
        }
        // Groq doesn't have TTS

        if (audioBase64) {
          podcast.audioBase64 = audioBase64;
          podcast.audioGenerated = true;
        } else {
          podcast.audioGenerated = false;
          podcast.audioError =
            config.provider === "groq"
              ? "Groq 不支援語音合成，請改用 Google 或 OpenAI"
              : "TTS 生成失敗，請確認 API Key 已啟用 TTS 服務";
        }
      } catch (err) {
        podcast.audioGenerated = false;
        podcast.audioError =
          err instanceof Error ? err.message : "TTS 服務不可用";
      }
    }

    return NextResponse.json({ podcast });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成 Podcast 失敗";
    console.error("生成 Podcast 失敗:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
