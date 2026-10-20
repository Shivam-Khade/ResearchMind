"use client";

import React, { useState } from "react";
import {
  Cpu,
  Sparkles,
  Zap,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  Server,
  Key,
} from "lucide-react";

export type ModelProvider = "gemini" | "groq" | "huggingface";

export interface ModelOption {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  badge: string;
  status: "ready" | "quota_exhausted" | "needs_key";
}

export const AVAILABLE_MODELS: ModelOption[] = [
  // Google Gemini
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    description: "Recommended: Ultra-fast, active high-throughput Google GenAI model without quota restrictions.",
    badge: "Recommended",
    status: "ready",
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    provider: "gemini",
    description: "Lightweight experimental Gemini 3.5 preview with rapid token generation.",
    badge: "Fast Preview",
    status: "ready",
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash Latest",
    provider: "gemini",
    description: "Google's production flash alias point-in-time release.",
    badge: "Stable",
    status: "ready",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    provider: "gemini",
    description: "Google free tier currently limited to 20 requests/day (429 quota reached; auto-falls back to 2.5 Flash).",
    badge: "20 Req/Day Quota",
    status: "quota_exhausted",
  },
  // Groq
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B (Groq)",
    provider: "groq",
    description: "State-of-the-art open weights model running at 300+ tokens/sec on Groq LPUs.",
    badge: "Ultra Fast",
    status: "ready",
  },
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B (Groq)",
    provider: "groq",
    description: "Instant sub-second inference for high-speed research synthesis.",
    badge: "Instant",
    status: "ready",
  },
  // Hugging Face
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B (Hugging Face)",
    provider: "huggingface",
    description: "Hosted on Hugging Face Serverless Inference using your connected access token.",
    badge: "Open Weights",
    status: "ready",
  },
  {
    id: "Qwen/Qwen2.5-72B-Instruct",
    name: "Qwen 2.5 72B (Hugging Face)",
    provider: "huggingface",
    description: "Premier open-source reasoning model via Hugging Face Hub.",
    badge: "Reasoning",
    status: "ready",
  },
  {
    id: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
    name: "DeepSeek R1 Distill (Hugging Face)",
    provider: "huggingface",
    description: "Distilled reasoning model with chain-of-thought analysis.",
    badge: "DeepSeek",
    status: "ready",
  },
];

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProvider: ModelProvider;
  selectedModel: string;
  onSelect: (provider: ModelProvider, model: string) => void;
}

export function ModelSelectorModal({
  isOpen,
  onClose,
  selectedProvider,
  selectedModel,
  onSelect,
}: ModelSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<ModelProvider>(selectedProvider);

  if (!isOpen) return null;

  const filteredModels = AVAILABLE_MODELS.filter((m) => m.provider === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d0d12] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Model & Provider Settings</h2>
              <p className="text-[11px] text-text-muted">Choose the LLM engine powering the 4-agent research pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="px-5 pt-3 border-b border-white/5 flex gap-2 bg-white/[0.01]">
          <button
            onClick={() => setActiveTab("gemini")}
            className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "gemini"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">Active</span>
          </button>

          <button
            onClick={() => setActiveTab("groq")}
            className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "groq"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Groq</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono">Ultra Fast</span>
          </button>

          <button
            onClick={() => setActiveTab("huggingface")}
            className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "huggingface"
                ? "border-sky-400 text-sky-300"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Hugging Face</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 font-mono">Free Models</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          {activeTab === "gemini" && (
            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                <strong>Gemini 2.5 Flash</strong> is verified and working without the 20 req/day quota limit of 3.5 Flash. If any selected model hits rate limits, the system auto-recovers with Gemini 2.5 Flash.
              </span>
            </div>
          )}

          {activeTab === "groq" && (
            <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2 mb-3">
              <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Groq delivers lightning-fast token generation. Uses the <code>GROQ_API_KEY</code> configured in your <code>.env</code> file.
              </span>
            </div>
          )}

          {activeTab === "huggingface" && (
            <div className="p-2.5 rounded-xl bg-sky-500/5 border border-sky-500/20 text-[11px] text-sky-300 flex items-start gap-2 mb-3">
              <Server className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Uses your configured <code>HUGGINGFACEHUB_ACCESS_TOKEN</code> (<code>hf_jzyiS...</code>) for open-weights models.
              </span>
            </div>
          )}

          <div className="space-y-2">
            {filteredModels.map((model) => {
              const isSelected = selectedModel === model.id;
              const isExhausted = model.status === "quota_exhausted";

              return (
                <div
                  key={model.id}
                  onClick={() => {
                    onSelect(model.provider, model.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-text-primary">{model.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          isExhausted
                            ? "bg-rose-500/15 text-rose-300 border border-rose-500/20"
                            : "bg-white/5 text-text-secondary border border-white/5"
                        }`}
                      >
                        {model.badge}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">{model.description}</p>
                  </div>

                  <div className="pt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-emerald-400 bg-emerald-400 text-black"
                          : "border-white/20 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between bg-white/[0.02] text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-text-muted" />
            <span>Keys configured in <code>.env</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
