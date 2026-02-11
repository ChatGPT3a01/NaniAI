"use client";

import { useState, useEffect } from "react";
import { Key, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { PROVIDER_MODELS, AIProvider } from "@/lib/ai/provider";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [provider, setProvider] = useState<AIProvider>("google");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProvider = localStorage.getItem("ai_provider") as AIProvider;
    const savedKey = localStorage.getItem("ai_api_key");
    const savedModel = localStorage.getItem("ai_model");
    if (savedProvider) setProvider(savedProvider);
    if (savedKey) setApiKey(savedKey);
    if (savedModel) setModel(savedModel);
  }, []);

  // Update default model when provider changes
  useEffect(() => {
    const defaultModel = PROVIDER_MODELS[provider].models[0].id;
    setModel(defaultModel);
  }, [provider]);

  function handleSave() {
    localStorage.setItem("ai_provider", provider);
    localStorage.setItem("ai_api_key", apiKey);
    localStorage.setItem("ai_model", model);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleVerify() {
    if (!apiKey) {
      setVerifyResult({ ok: false, message: "請先輸入 API Key" });
      return;
    }

    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch("/api/api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-provider": provider,
          "x-ai-api-key": apiKey,
          "x-ai-model": model,
        },
        body: JSON.stringify({ provider, model }),
      });

      const data = await res.json();
      if (res.ok) {
        setVerifyResult({ ok: true, message: "API Key 驗證成功！" });
      } else {
        setVerifyResult({
          ok: false,
          message: data.error || "API Key 驗證失敗",
        });
      }
    } catch {
      setVerifyResult({ ok: false, message: "驗證請求失敗，請確認網路連線" });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">API Key 設定</h1>
        <p className="mt-1 text-sm text-muted">
          設定您的 AI 服務 API Key，此資訊僅儲存在您的本機端，不會上傳至網路
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-border bg-white p-6 shadow-sm">
        {/* Provider 選擇 */}
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground">
            AI 服務提供者
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(PROVIDER_MODELS) as [AIProvider, typeof PROVIDER_MODELS[AIProvider]][]).map(
              ([key, val]) => (
                <button
                  key={key}
                  onClick={() => setProvider(key)}
                  className={cn(
                    "rounded-lg border-2 p-3 text-center text-sm font-medium transition-all",
                    provider === key
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-foreground hover:border-gray-300"
                  )}
                >
                  {val.label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Model 選擇 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            模型
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {PROVIDER_MODELS[provider].models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* API Key 輸入 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            API Key
          </label>
          <div className="relative">
            <Key
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="輸入您的 API Key..."
              className="w-full rounded-lg border border-border py-2.5 pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            API Key 僅儲存在您的瀏覽器中，不會傳送到我們的伺服器
          </p>
        </div>

        {/* 驗證結果 */}
        {verifyResult && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg p-3 text-sm",
              verifyResult.ok
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {verifyResult.ok ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {verifyResult.message}
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle size={16} />
            設定已儲存！
          </div>
        )}

        {/* 按鈕 */}
        <div className="flex gap-3">
          <button
            onClick={handleVerify}
            disabled={verifying || !apiKey}
            className={cn(
              "flex-1 rounded-lg border border-primary px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5",
              (verifying || !apiKey) && "cursor-not-allowed opacity-50"
            )}
          >
            {verifying ? "驗證中..." : "驗證 API Key"}
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey}
            className={cn(
              "flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover",
              !apiKey && "cursor-not-allowed opacity-50"
            )}
          >
            儲存設定
          </button>
        </div>
      </div>
    </div>
  );
}
