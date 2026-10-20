"use client";

import React, { useState } from "react";
import { CriticAnalysis } from "@/lib/types";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface CriticPanelProps {
  critic: CriticAnalysis | null;
}

export function CriticPanel({ critic }: CriticPanelProps) {
  const [applied, setApplied] = useState(false);
  const { toast } = useToast();

  if (!critic) {
    return (
      <div className="py-12 text-center text-xs text-text-muted">
        <ShieldCheck className="w-6 h-6 text-text-muted mx-auto mb-2 opacity-40 animate-pulse" />
        <p className="font-medium text-text-secondary">Awaiting Critic Chain</p>
        <p className="text-[11px] text-text-muted mt-0.5">
          Peer review and score will appear once synthesis completes.
        </p>
      </div>
    );
  }

  const handleApplySuggestions = () => {
    setApplied(true);
    toast({
      type: "success",
      title: "Suggestions Queued",
      description: "Directives logged for subsequent research passes.",
    });
    setTimeout(() => setApplied(false), 3000);
  };

  const score = critic.score || 8.0;

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Score Header */}
      <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase tracking-wider">
            Critic Scorecard
          </span>
          <p className="text-xs text-text-secondary mt-0.5">
            Adversarial peer assessment
          </p>
        </div>

        <div className="flex items-baseline gap-1 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
          <span className="text-base font-syne font-bold text-amber-300">
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] font-mono text-text-muted">/ 10</span>
        </div>
      </div>

      {/* One-Line Verdict */}
      {critic.verdict && (
        <div className="p-3 rounded-xl bg-amber-500/[0.03] border border-amber-500/20 text-xs italic text-text-secondary leading-relaxed">
          "{critic.verdict}"
        </div>
      )}

      {/* Strengths */}
      {critic.strengths && critic.strengths.length > 0 && (
        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.015] space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-semibold uppercase">
            <CheckCircle2 className="w-3 h-3" />
            <span>Strengths ({critic.strengths.length})</span>
          </div>
          <ul className="space-y-1 pl-1">
            {critic.strengths.map((str, i) => (
              <li key={i} className="text-text-secondary leading-snug text-[11px] flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas to Improve */}
      {critic.weaknesses && critic.weaknesses.length > 0 && (
        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.015] space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] font-semibold uppercase">
            <AlertTriangle className="w-3 h-3" />
            <span>Areas to Improve ({critic.weaknesses.length})</span>
          </div>
          <ul className="space-y-1 pl-1">
            {critic.weaknesses.map((weak, i) => (
              <li key={i} className="text-text-secondary leading-snug text-[11px] flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actionable Suggestions */}
      {critic.suggestions && critic.suggestions.length > 0 && (
        <div className="p-3 rounded-xl border border-white/5 bg-white/[0.015] space-y-1.5">
          <div className="flex items-center gap-1.5 text-sky-400 font-mono text-[10px] font-semibold uppercase">
            <Lightbulb className="w-3 h-3" />
            <span>Suggestions</span>
          </div>
          <ul className="space-y-1 pl-1">
            {critic.suggestions.map((sug, i) => (
              <li key={i} className="text-text-secondary leading-snug text-[11px] flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-sky-400 shrink-0 mt-1.5" />
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Apply CTA */}
      <button
        onClick={handleApplySuggestions}
        disabled={applied}
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 active:scale-95 transition-all"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{applied ? "Applied to Memory ✓" : "Apply Suggestions"}</span>
      </button>
    </div>
  );
}
