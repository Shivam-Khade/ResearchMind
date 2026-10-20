"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  Search,
  BookOpen,
  PenTool,
  ShieldCheck,
  Sparkles,
  CornerDownLeft,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { ResearchRun } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface HeroSectionProps {
  onRun: (topic: string) => void;
  recentRuns: ResearchRun[];
  onSelectRun: (run: ResearchRun) => void;
}

const SUGGESTIONS = [
  "Autonomous multi-agent AI architectures",
  "CRISPR gene editing & base editing breakthroughs",
  "Commercial fusion energy & superconductors",
  "Quantum error correction & logical qubits",
  "Post-silicon semiconductor materials",
  "Long-horizon reasoning benchmarks in 2025",
];

const AGENT_STEPS = [
  {
    step: "01",
    name: "Search Agent",
    role: "Finds authoritative web indices & ranks sources",
    icon: Search,
  },
  {
    step: "02",
    name: "Reader Agent",
    role: "Deep-scrapes high-signal URLs for raw text",
    icon: BookOpen,
  },
  {
    step: "03",
    name: "Writer Chain",
    role: "Synthesizes multi-section markdown dossier",
    icon: PenTool,
  },
  {
    step: "04",
    name: "Critic Chain",
    role: "Adversarial review with 10-point scorecard",
    icon: ShieldCheck,
  },
];

export function HeroSection({ onRun, recentRuns, onSelectRun }: HeroSectionProps) {
  const [topicInput, setTopicInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [topicInput]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicInput.trim()) return;
    onRun(topicInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pt-12 pb-20 sm:pt-20 sm:pb-28 flex flex-col items-center text-center">
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-amber-500/10 border border-amber-500/20 text-amber-300 mb-6 shadow-sm"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        MULTI-AGENT AI RESEARCH SYSTEM
      </motion.div>

      {/* Hero Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-syne font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight text-text-primary mb-4 leading-[1.08]"
      >
        Research<span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">Mind</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-base sm:text-lg text-text-secondary max-w-2xl mb-10 leading-relaxed font-normal"
      >
        Autonomous multi-agent intelligence orchestrating web search, deep resource scraping, long-form synthesis, and adversarial peer critique.
      </motion.p>

      {/* Main Command Input Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="w-full relative group mb-6"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/25 via-amber-600/15 to-amber-400/25 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative glass-panel rounded-2xl p-2 sm:p-3 border border-white/10 shadow-2xl focus-within:border-amber-500/50 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
          <textarea
            ref={textareaRef}
            rows={2}
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want researched? (e.g., Breakthroughs in autonomous LLM agents)"
            className="w-full bg-transparent resize-none border-none outline-none text-text-primary placeholder:text-text-muted text-sm sm:text-base px-3 py-2 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 px-2 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-text-muted font-mono text-[11px]">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-text-secondary text-[10px]">
                ⌘ / Ctrl
              </kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-text-secondary text-[10px]">
                Enter
              </kbd>
              <span className="hidden sm:inline text-text-muted ml-1">to run research</span>
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={!topicInput.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow transition-all"
            >
              <span>Run research</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Suggestion Chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full flex flex-wrap items-center justify-center gap-2 mb-14"
      >
        <span className="text-xs font-mono text-text-muted mr-1">Suggested topics:</span>
        {SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            onClick={() => {
              setTopicInput(sug);
              if (textareaRef.current) textareaRef.current.focus();
            }}
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border hover:border-amber-500/30 text-text-secondary hover:text-text-primary transition-all active:scale-95"
          >
            {sug}
          </button>
        ))}
      </motion.div>

      {/* "How It Works" Strip: 4 Agents Connected by Animated Line */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="w-full glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg text-left mb-12"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-text-secondary font-semibold">
              The 4-Agent Sequential Pipeline
            </h2>
          </div>
          <span className="text-[11px] font-mono text-text-muted">Autonomous Handoff Architecture</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {AGENT_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative flex flex-col p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/25 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">{step.step}</span>
                </div>
                <h3 className="text-xs font-semibold text-text-primary mb-1">{step.name}</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed">{step.role}</p>

                {/* Connecting arrow for larger screens */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-white/20">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Runs Strip */}
      {recentRuns.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full text-left"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
              Recent Research Runs ({recentRuns.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentRuns.slice(0, 3).map((run) => (
              <button
                key={run.id}
                onClick={() => onSelectRun(run)}
                className="text-left p-3 rounded-xl glass-panel-interactive border border-white/5 hover:border-amber-500/30 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(run.createdAt)}
                    </span>
                    {run.critic && (
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        {run.critic.score}/10
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-medium text-text-primary line-clamp-2 group-hover:text-amber-300 transition-colors">
                    {run.topic}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-text-muted mt-3 pt-2 border-t border-white/5">
                  <span>{run.duration.toFixed(1)}s elapsed</span>
                  <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[10px]">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
