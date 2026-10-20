"use client";

import React, { useState } from "react";
import {
  Sparkles,
  History,
  Sun,
  Moon,
  Command,
  Plus,
  RotateCw,
  StopCircle,
  Bug,
  CheckCircle2,
  Loader2,
  Cpu,
  ChevronDown,
} from "lucide-react";
import { AgentId } from "@/lib/types";

interface NavbarProps {
  status: "idle" | "running" | "completed" | "failed" | "cancelled";
  topic?: string;
  overallProgress?: number;
  totalElapsed?: number;
  historyCount: number;
  executionMode?: "real" | "mock";
  selectedProvider?: string;
  selectedModel?: string;
  onOpenModelSelector?: () => void;
  onToggleMode?: () => void;
  onOpenHistory: () => void;
  onOpenCommandPalette: () => void;
  onNewResearch: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  simulateErrorOnAgent: AgentId | null;
  onSetSimulateError: (agent: AgentId | null) => void;
}

export function Navbar({
  status,
  topic,
  overallProgress = 0,
  totalElapsed = 0,
  historyCount,
  executionMode = "real",
  selectedProvider = "gemini",
  selectedModel = "gemini-2.5-flash",
  onOpenModelSelector,
  onToggleMode,
  onOpenHistory,
  onOpenCommandPalette,
  onNewResearch,
  onCancel,
  onRetry,
  simulateErrorOnAgent,
  onSetSimulateError,
}: NavbarProps) {
  const [isLight, setIsLight] = useState(false);
  const [showSimMenu, setShowSimMenu] = useState(false);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("light")) {
      html.classList.remove("light");
      html.classList.add("dark");
      setIsLight(false);
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
      setIsLight(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-14 border-b border-surface-border bg-background/90 backdrop-blur-xl transition-colors shrink-0">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Left: Brand & Active Topic */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onNewResearch}
            className="flex items-center gap-2 group text-left focus:outline-none rounded-lg p-0.5"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 p-[1px] flex items-center justify-center shadow-glow">
              <div className="w-full h-full bg-[#0d0d14] rounded-[7px] flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="font-syne font-bold text-sm tracking-tight text-text-primary">
              Research<span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Mind</span>
            </span>
          </button>

          {/* Active Topic in Header */}
          {topic && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10 min-w-0">
              <span className="text-xs text-text-secondary truncate max-w-xs font-normal">
                {topic}
              </span>
            </div>
          )}
        </div>

        {/* Center: Live Status & Progress */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono">
          {status === "running" && (
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300">
              <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
              <span>Running ({overallProgress}%)</span>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-text-muted hover:text-rose-400 text-[10px] pl-1.5 border-l border-amber-500/30 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          {status === "completed" && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete ({totalElapsed.toFixed(1)}s)</span>
            </div>
          )}

          {status === "failed" && (
            <div className="flex items-center gap-2 text-rose-400 text-[11px]">
              <span>Pipeline halted</span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] transition-all"
                >
                  <RotateCw className="w-2.5 h-2.5" />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Model Selector Button */}
          {executionMode === "real" && onOpenModelSelector && (
            <button
              onClick={onOpenModelSelector}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border bg-white/5 border-white/10 text-text-secondary hover:text-white hover:bg-white/10"
              title="Click to change model (Gemini, Groq, Hugging Face)"
            >
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] font-medium text-white max-w-[120px] truncate">
                {selectedModel.replace("meta-llama/", "").replace("deepseek-ai/", "").replace("Qwen/", "")}
              </span>
              <ChevronDown className="w-3 h-3 text-text-muted" />
            </button>
          )}

          {/* Live vs Mock Mode Switcher */}
          {onToggleMode && (
            <button
              onClick={onToggleMode}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                executionMode === "real"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                  : "bg-white/5 border-white/10 text-text-muted hover:text-white"
              }`}
              title="Click to toggle between Real Python Gemini+Tavily and Fast Simulation"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  executionMode === "real" ? "bg-emerald-400 animate-pulse" : "bg-text-muted"
                }`}
              />
              <span className="text-[11px]">
                {executionMode === "real" ? "Live Real" : "Preview Mode"}
              </span>
            </button>
          )}

          {/* Subtle Dev Simulation Icon */}
          <div className="relative">
            <button
              onClick={() => setShowSimMenu(!showSimMenu)}
              className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
                simulateErrorOnAgent
                  ? "text-rose-400 bg-rose-500/10"
                  : "text-text-muted hover:text-text-primary hover:bg-white/5"
              }`}
              title="Test agent error states"
            >
              <Bug className="w-3.5 h-3.5" />
            </button>

            {showSimMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#12121a] p-1.5 shadow-2xl z-50 text-xs font-mono">
                <div className="px-2 py-1 text-[10px] text-text-muted uppercase">
                  Simulate Error:
                </div>
                {(["none", "search", "reader", "writer", "critic"] as const).map((agentKey) => (
                  <button
                    key={agentKey}
                    onClick={() => {
                      onSetSimulateError(agentKey === "none" ? null : agentKey);
                      setShowSimMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between capitalize ${
                      (agentKey === "none" && !simulateErrorOnAgent) ||
                      simulateErrorOnAgent === agentKey
                        ? "bg-amber-500/15 text-amber-300"
                        : "hover:bg-white/5 text-text-secondary hover:text-white"
                    }`}
                  >
                    <span>{agentKey}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Topic */}
          <button
            onClick={onNewResearch}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all flex items-center gap-1"
            title="Start new research inquiry"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all flex items-center gap-1.5"
            title="Open research history"
          >
            <History className="w-3.5 h-3.5 text-text-muted" />
            {historyCount > 0 && (
              <span className="text-[10px] font-mono text-amber-300">
                {historyCount}
              </span>
            )}
          </button>

          {/* Command Palette */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
            title="Open command palette (⌘K)"
          >
            <Command className="w-3 h-3" />
            <span className="text-[10px]">K</span>
          </button>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
            title="Toggle theme"
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
