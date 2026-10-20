"use client";

import React from "react";
import { Sparkles, Search, BookOpen, PenTool, ShieldCheck, Loader2 } from "lucide-react";
import { AgentId } from "@/lib/types";

interface WaitingStateProps {
  currentAgent: AgentId | null;
  topic: string;
}

export function WaitingState({ currentAgent, topic }: WaitingStateProps) {
  const getNarration = () => {
    switch (currentAgent) {
      case "search":
        return {
          title: "Search Agent is gathering sources…",
          subtitle: `Scanning academic repositories, preprints, and real-time web indices for verified data on "${topic}".`,
          icon: Search,
        };
      case "reader":
        return {
          title: "Reader Agent is deep-scraping primary source…",
          subtitle: "Extracting canonical text, stripping DOM boilerplate, and compiling dense analytical excerpts.",
          icon: BookOpen,
        };
      case "writer":
        return {
          title: "Writer Chain is drafting synthesis dossier…",
          subtitle: "Fusing search metadata and scraped content into a multi-section markdown research report with comparative benchmarks.",
          icon: PenTool,
        };
      case "critic":
        return {
          title: "Critic Chain is performing peer review…",
          subtitle: "Scoring empirical depth, structural flow, and fact verification against a strict adversarial rubric.",
          icon: ShieldCheck,
        };
      default:
        return {
          title: "Initializing multi-agent pipeline…",
          subtitle: "Allocating agent memory buffers and establishing deterministic handoff contracts.",
          icon: Sparkles,
        };
    }
  };

  const narration = getNarration();
  const Icon = narration.icon;

  return (
    <div className="w-full max-w-[72ch] mx-auto py-12 px-4 flex flex-col items-center">
      {/* Activity Narration Banner */}
      <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 shadow-glow mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 animate-pulse" />

        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-glow">
          <Icon className="w-6 h-6 animate-pulse" />
        </div>

        <h3 className="text-base sm:text-lg font-syne font-bold text-text-primary mb-1.5 flex items-center justify-center gap-2">
          <span>{narration.title}</span>
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
        </h3>

        <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
          {narration.subtitle}
        </p>
      </div>

      {/* Graceful Editorial Skeleton */}
      <div className="w-full space-y-6 opacity-40 select-none pointer-events-none">
        {/* Title skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-white/10 rounded-lg w-3/4 animate-pulse" />
          <div className="h-4 bg-white/5 rounded-md w-1/2 animate-pulse" />
        </div>

        {/* Section 1 skeleton */}
        <div className="space-y-2.5 pt-4">
          <div className="h-5 bg-white/10 rounded-md w-1/3 animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-11/12 animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-4/5 animate-pulse" />
        </div>

        {/* Callout box skeleton */}
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
          <div className="h-3 bg-amber-500/10 rounded w-1/4 animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-5/6 animate-pulse" />
        </div>

        {/* Table skeleton */}
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            <div className="h-3 bg-white/10 rounded" />
            <div className="h-3 bg-white/10 rounded" />
            <div className="h-3 bg-white/10 rounded" />
            <div className="h-3 bg-white/10 rounded" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="h-3 bg-white/5 rounded" />
            <div className="h-3 bg-white/5 rounded" />
            <div className="h-3 bg-white/5 rounded" />
            <div className="h-3 bg-white/5 rounded" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="h-3 bg-white/5 rounded" />
            <div className="h-3 bg-white/5 rounded" />
            <div className="h-3 bg-white/5 rounded" />
            <div className="h-3 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
