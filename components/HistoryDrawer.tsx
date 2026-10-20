"use client";

import React, { useState } from "react";
import {
  X,
  History,
  Trash2,
  Clock,
  ArrowUpRight,
  Search,
  Download,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { ResearchRun } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  runs: ResearchRun[];
  onSelectRun: (run: ResearchRun) => void;
  onDeleteRun: (runId: string) => void;
  onClearAll: () => void;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  runs,
  onSelectRun,
  onDeleteRun,
  onClearAll,
}: HistoryDrawerProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredRuns = runs.filter((r) =>
    r.topic.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(runs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `researchmind-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-md bg-[#0e0e15] border-l border-white/10 shadow-2xl h-full flex flex-col z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-syne font-bold text-text-primary tracking-tight">
              Research History
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-text-muted">
              {runs.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {runs.length > 0 && (
              <button
                onClick={handleExportJSON}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                title="Export history as JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter past dossiers…"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-amber-500/40 font-sans"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredRuns.length > 0 ? (
            filteredRuns.map((run) => (
              <div
                key={run.id}
                className="p-3.5 rounded-xl glass-panel-interactive border border-white/5 hover:border-amber-500/30 group flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(run.createdAt)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {run.critic && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          {run.critic.score}/10
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-text-muted">
                        {run.duration.toFixed(1)}s
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-semibold text-text-primary mb-2 line-clamp-2 leading-relaxed group-hover:text-amber-300 transition-colors">
                    {run.topic}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono">
                  <button
                    onClick={() => {
                      onSelectRun(run);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    <span>Load dossier</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRun(run.id);
                    }}
                    className="text-text-muted hover:text-rose-400 p-1 rounded transition-colors"
                    title="Delete run"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 px-4">
              <FileCheck className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-xs font-medium text-text-secondary">No history found</p>
              <p className="text-[11px] text-text-muted mt-1">
                Completed research runs are automatically stored here for instant recall.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {runs.length > 0 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">{runs.length} runs saved locally</span>
            <button
              onClick={onClearAll}
              className="text-rose-400/80 hover:text-rose-300 text-[11px] transition-colors"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
