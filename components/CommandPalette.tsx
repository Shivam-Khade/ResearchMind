"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  History,
  Sun,
  Moon,
  Copy,
  Download,
  FileText,
  Sliders,
  X,
  CornerDownLeft,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { ResearchRun } from "@/lib/types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewResearch: () => void;
  onOpenHistory: () => void;
  onCopyReport: () => void;
  onDownloadReport: () => void;
  onExportPDF: () => void;
  onSwitchTab: (tab: "sources" | "critic" | "raw") => void;
  recentRuns: ResearchRun[];
  onSelectRun: (run: ResearchRun) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNewResearch,
  onOpenHistory,
  onCopyReport,
  onDownloadReport,
  onExportPDF,
  onSwitchTab,
  recentRuns,
  onSelectRun,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("light")) {
      html.classList.remove("light");
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
    }
    onClose();
  };

  const actions = [
    {
      id: "new",
      label: "Start New Research",
      icon: Sparkles,
      shortcut: "⌘N",
      action: () => {
        onNewResearch();
        onClose();
      },
    },
    {
      id: "history",
      label: "Open Research History",
      icon: History,
      shortcut: "⌘H",
      action: () => {
        onOpenHistory();
        onClose();
      },
    },
    {
      id: "theme",
      label: "Toggle Theme (Dark / Warm Paper)",
      icon: Sun,
      shortcut: "⌘T",
      action: toggleTheme,
    },
    {
      id: "copy",
      label: "Copy Report Markdown",
      icon: Copy,
      shortcut: "⌘C",
      action: () => {
        onCopyReport();
        onClose();
      },
    },
    {
      id: "download",
      label: "Download Report as .md",
      icon: Download,
      shortcut: "⌘D",
      action: () => {
        onDownloadReport();
        onClose();
      },
    },
    {
      id: "pdf",
      label: "Export PDF (Print Dialog)",
      icon: FileText,
      shortcut: "⌘P",
      action: () => {
        onExportPDF();
        onClose();
      },
    },
    {
      id: "tab-sources",
      label: "View Sources Rail",
      icon: Sliders,
      shortcut: "[",
      action: () => {
        onSwitchTab("sources");
        onClose();
      },
    },
    {
      id: "tab-critic",
      label: "View Critic Scorecard",
      icon: Sliders,
      shortcut: "]",
      action: () => {
        onSwitchTab("critic");
        onClose();
      },
    },
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRuns = recentRuns.filter((r) =>
    r.topic.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search past research…"
            className="w-full bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                Quick Actions
              </div>
              {filteredActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-text-primary hover:bg-white/5 hover:text-amber-300 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-text-muted group-hover:text-amber-400 transition-colors" />
                      <span>{action.label}</span>
                    </div>
                    {action.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-text-muted text-[10px] font-mono">
                        {action.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Past Runs Section */}
          {filteredRuns.length > 0 && (
            <div className="pt-2">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted">
                Recent Research Dossiers
              </div>
              {filteredRuns.map((run) => (
                <button
                  key={run.id}
                  onClick={() => {
                    onSelectRun(run);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors group text-left"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText className="w-3.5 h-3.5 text-text-muted group-hover:text-amber-400 shrink-0" />
                    <span className="truncate">{run.topic}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {run.critic && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {run.critic.score}/10
                      </span>
                    )}
                    <ArrowRight className="w-3 h-3 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {filteredActions.length === 0 && filteredRuns.length === 0 && (
            <div className="py-8 text-center text-xs text-text-muted">
              No matching commands or past research dossiers found.
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-white/[0.01] border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span>Navigate with arrows</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
