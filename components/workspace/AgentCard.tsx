"use client";

import React from "react";
import {
  Search,
  BookOpen,
  PenTool,
  ShieldCheck,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { AgentId, AgentStatus } from "@/lib/types";
import { formatTime } from "@/lib/utils";

interface AgentCardProps {
  id: AgentId;
  stepNumber: number;
  name: string;
  role: string;
  status: AgentStatus;
  elapsed: number;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onRetry: () => void;
  onViewRaw: () => void;
}

const AGENT_ICONS = {
  search: Search,
  reader: BookOpen,
  writer: PenTool,
  critic: ShieldCheck,
};

export function AgentCard({
  id,
  stepNumber,
  name,
  role,
  status,
  elapsed,
  isActive,
  isSelected,
  onSelect,
  onRetry,
  onViewRaw,
}: AgentCardProps) {
  const Icon = AGENT_ICONS[id];

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-xl p-3 cursor-pointer transition-all duration-200 border select-none ${
        isActive || status === "running"
          ? "border-amber-500/50 bg-amber-500/[0.04] shadow-glow"
          : isSelected
          ? "border-white/20 bg-white/[0.04]"
          : status === "done"
          ? "border-white/5 bg-white/[0.015] hover:border-white/15 hover:bg-white/[0.03]"
          : status === "error"
          ? "border-rose-500/40 bg-rose-500/[0.05]"
          : status === "blocked"
          ? "border-white/5 bg-transparent opacity-40 cursor-not-allowed"
          : "border-white/5 bg-transparent opacity-60 hover:opacity-90"
      }`}
    >
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Step / Icon / Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
              status === "running"
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : status === "done"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : status === "error"
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                : "bg-white/5 border-white/10 text-text-muted"
            }`}
          >
            {status === "running" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : status === "done" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Icon className="w-3.5 h-3.5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-text-muted">0{stepNumber}</span>
              <h4 className="text-xs font-semibold text-text-primary truncate">
                {name}
              </h4>
            </div>
            <p className="text-[11px] text-text-muted truncate leading-tight">
              {role}
            </p>
          </div>
        </div>

        {/* Right: Status Pill & Time */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-text-muted">
            {elapsed > 0 ? formatTime(elapsed) : ""}
          </span>

          {status === "running" && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}

          {status === "error" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all active:scale-95"
            >
              <RotateCw className="w-2.5 h-2.5" />
              <span>Retry</span>
            </button>
          )}

          {status === "blocked" && (
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-text-muted">
              Blocked
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
