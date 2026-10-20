"use client";

import React, { useRef, useEffect, useState } from "react";
import { AgentLogItem } from "@/lib/types";
import { ArrowDown, Terminal } from "lucide-react";

interface LogStreamProps {
  logs: AgentLogItem[];
  isRunning?: boolean;
}

export function LogStream({ logs, isRunning = false }: LogStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll on logs change
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 20;
    setAutoScroll(isAtBottom);
  };

  const formatLogTime = (ts: number): string => {
    const d = new Date(ts);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    const s = d.getSeconds().toString().padStart(2, "0");
    const ms = d.getMilliseconds().toString().padStart(3, "0");
    return `${h}:${m}:${s}.${ms}`;
  };

  return (
    <div className="relative flex flex-col bg-black/40 rounded-xl border border-white/5 overflow-hidden text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.02] border-b border-white/5 text-[10px] text-text-muted">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-amber-400" />
          <span>Execution Log Stream</span>
          {isRunning && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping ml-1" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>{logs.length} events</span>
          <button
            onClick={() => {
              setAutoScroll(true);
              if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
              }
            }}
            className={`p-0.5 rounded transition-colors ${
              autoScroll ? "text-amber-400" : "text-text-muted hover:text-white"
            }`}
            title="Auto-scroll to bottom"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Log lines */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="max-h-48 overflow-y-auto p-2.5 space-y-1.5 font-mono select-text"
      >
        {logs.length === 0 ? (
          <div className="text-text-muted/60 italic py-2 text-[11px]">
            Waiting for agent execution to start…
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={`${log.ts}-${idx}`}
              className="flex items-start gap-2 leading-relaxed text-[11px] hover:bg-white/[0.02] px-1 py-0.5 rounded"
            >
              <span className="text-text-muted/60 shrink-0 select-none text-[10px]">
                {formatLogTime(log.ts)}
              </span>
              <span
                className={`break-words ${
                  log.level === "error"
                    ? "text-rose-400 font-medium"
                    : log.level === "warn"
                    ? "text-amber-300"
                    : log.level === "success"
                    ? "text-emerald-400"
                    : "text-text-secondary"
                }`}
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
