import { NextRequest, NextResponse } from "next/server";
import { getApiConfig } from "@/lib/ai/provider";
import { callLLM } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const config = getApiConfig(request.headers);
    // Simple validation: try a minimal generation
    const result = await callLLM(config, "回覆「OK」即可。");
    if (result) {
      return NextResponse.json({ valid: true, message: "API Key 驗證成功" });
    }
    return NextResponse.json({ error: "API Key 無效" }, { status: 401 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "驗證失敗";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
