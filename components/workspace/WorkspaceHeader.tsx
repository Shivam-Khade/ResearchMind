"use client";

import React from "react";
import {
  Sparkles,
  StopCircle,
  RotateCw,
  Plus,
  Share2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface WorkspaceHeaderProps {
  topic: string;
  status: "idle" | "running" | "completed" | "failed" | "cancelled";
  overallProgress: number;
  totalElapsed: number;
  onCancel: () => void;
  onRetryPipeline?: () => void;
  onNewTopic: () => void;
  onShareReport?: () => void;
}

export function WorkspaceHeader({
  topic,
  status,
  overallProgress,
  totalElapsed,
  onCancel,
  onRetryPipeline,
  onNewTopic,
  onShareReport,
}: WorkspaceHeaderProps) {
  return (
    <div className="w-full border-b border-surface-border bg-background/50 backdrop-blur-md px-4 sm:px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Active Topic & Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Active Research Dossier
            </span>
            <span className="text-text-muted text-xs">·</span>
            <span className="text-[11px] font-mono text-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(totalElapsed)}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-syne font-bold text-text-primary truncate">
            {topic || "Untitled Research Inquiry"}
          </h2>
        </div>

        {/* Center: Overall Progress Bar */}
        <div className="flex items-center gap-3 w-full md:w-64">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-text-muted mb-1">
              <span>Pipeline Progress</span>
              <span className="text-text-primary font-semibold">{overallProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  status === "failed"
                    ? "bg-rose-500"
                    : status === "completed"
                    ? "bg-emerald-400 shadow-glow-success"
                    : "bg-gradient-to-r from-amber-500 to-amber-400 shadow-glow"
                }`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {status === "running" && (
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all active:scale-95"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Cancel</span>
              <kbd className="hidden sm:inline text-[9px] px-1 py-0.2 bg-white/10 rounded">Esc</kbd>
            </button>
          )}

          {status === "failed" && onRetryPipeline && (
            <button
              onClick={onRetryPipeline}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry Pipeline</span>
            </button>
          )}

          {onShareReport && (
            <button
              onClick={onShareReport}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface border border-surface-border transition-all"
              title="Share research link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onNewTopic}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-primary bg-surface hover:bg-surface-hover border border-surface-border transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">New Topic</span>
          </button>
        </div>
      </div>
    </div>
  );
}
