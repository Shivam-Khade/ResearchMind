"use client";

import React from "react";
import { SourceItem } from "@/lib/types";
import { Globe, ExternalLink, Sparkles } from "lucide-react";

interface SourcesPanelProps {
  sources: SourceItem[];
  scrapedUrl?: string;
}

export function SourcesPanel({ sources, scrapedUrl }: SourcesPanelProps) {
  if (!sources || sources.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-text-muted">
        <Globe className="w-6 h-6 text-text-muted mx-auto mb-2 opacity-40 animate-pulse" />
        <p className="font-medium text-text-secondary">Awaiting Search Agent</p>
        <p className="text-[11px] text-text-muted mt-0.5">
          Verified sources will appear here once Search finishes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 font-sans select-none">
      <div className="flex items-center justify-between px-1 text-[11px] font-mono text-text-muted mb-1">
        <span>{sources.length} sources found</span>
        <span className="text-amber-400">1 deep-scraped</span>
      </div>

      <div className="space-y-2">
        {sources.map((src) => {
          const isTargetScraped =
            src.isScraped || (scrapedUrl && src.url.includes(scrapedUrl));

          return (
            <div
              key={src.id}
              className={`p-3 rounded-xl border transition-all duration-150 group ${
                isTargetScraped
                  ? "bg-amber-500/[0.04] border-amber-500/30"
                  : "bg-white/[0.015] hover:bg-white/[0.03] border-white/5"
              }`}
            >
              {/* Header: Domain & Scraped Tag */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
                  <Globe className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-text-primary font-medium">{src.domain}</span>
                </div>

                {isTargetScraped && (
                  <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Scraped
                  </span>
                )}
              </div>

              {/* Title with link */}
              <h5 className="text-xs font-medium text-text-primary mb-1 line-clamp-1 leading-snug group-hover:text-amber-300 transition-colors">
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <span>{src.title}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                </a>
              </h5>

              {/* Snippet */}
              <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                {src.snippet}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
