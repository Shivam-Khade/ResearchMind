"use client";

import React, { useState } from "react";
import { Copy, Check, FileCode, Layers } from "lucide-react";
import { useToast } from "@/components/Toast";

interface RawInspectorPanelProps {
  outputs: {
    search: string;
    reader: string;
    writer: string;
    critic: string;
  };
}

export function RawInspectorPanel({ outputs }: RawInspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<"search" | "reader" | "writer" | "critic">("search");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const currentContent = outputs[activeTab] || "";
  const lineCount = currentContent ? currentContent.split("\n").length : 0;
  const wordCount = currentContent ? currentContent.trim().split(/\s+/).length : 0;

  const handleCopy = () => {
    if (!currentContent) return;
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    toast({
      type: "success",
      title: "Raw Data Copied",
      description: `Copied raw payload for ${activeTab} agent to clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "search", label: "Search JSON" },
    { id: "reader", label: "Scraped Text" },
    { id: "writer", label: "Markdown" },
    { id: "critic", label: "Critic" },
  ] as const;

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] transition-all capitalize ${
              activeTab === t.id
                ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                : "text-text-muted hover:text-text-primary hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Info & Copy Bar */}
      <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
        <span>
          {lineCount} lines · {wordCount} words
        </span>
        <button
          onClick={handleCopy}
          disabled={!currentContent}
          className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Raw Content Block */}
      <div className="rounded-xl border border-white/10 bg-black/50 p-3 max-h-96 overflow-y-auto select-text">
        {currentContent ? (
          <pre className="whitespace-pre-wrap break-words text-text-secondary leading-relaxed text-[11px]">
            {currentContent}
          </pre>
        ) : (
          <div className="py-12 text-center text-text-muted italic">
            No raw payload received yet for {activeTab}.
          </div>
        )}
      </div>
    </div>
  );
}
