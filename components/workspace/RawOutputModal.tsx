"use client";

import React, { useState } from "react";
import { X, Copy, Check, Terminal, FileCode } from "lucide-react";
import { AgentId } from "@/lib/types";
import { useToast } from "@/components/Toast";

interface RawOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: AgentId;
  agentName: string;
  content: string;
}

export function RawOutputModal({
  isOpen,
  onClose,
  agentId,
  agentName,
  content,
}: RawOutputModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({
      type: "success",
      title: "Raw Output Copied",
      description: `Copied raw payload from ${agentName} to clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = content ? content.split("\n").length : 0;
  const charCount = content ? content.length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl bg-[#0f0f17] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileCode className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Raw Output · {agentName}
              </h3>
              <p className="text-[10px] font-mono text-text-muted">
                {lineCount} lines · {charCount.toLocaleString()} characters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-text-primary transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-text-muted" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-black/50 select-text">
          {content ? (
            <pre className="whitespace-pre-wrap break-words text-text-secondary leading-relaxed">
              {content}
            </pre>
          ) : (
            <div className="py-12 text-center text-text-muted italic">
              No raw output generated yet for this agent.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-text-muted">
          <span>Payload format: {agentId === "search" ? "JSON (Structured)" : "Text / Markdown"}</span>
          <button onClick={onClose} className="hover:text-text-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
