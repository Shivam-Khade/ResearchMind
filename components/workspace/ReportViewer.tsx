"use client";

import React, { useState, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Download,
  FileText,
  Maximize2,
  Minimize2,
  Check,
  List,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { WaitingState } from "./WaitingState";
import { AgentId } from "@/lib/types";
import { useToast } from "@/components/Toast";

interface ReportViewerProps {
  topic: string;
  report: string;
  isWriterDone: boolean;
  currentAgent: AgentId | null;
}

export function ReportViewer({
  topic,
  report,
  isWriterDone,
  currentAgent,
}: ReportViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTocDropdown, setShowTocDropdown] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCopyMarkdown = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    setCopied(true);
    toast({
      type: "success",
      title: "Markdown Copied",
      description: "Full research dossier copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMD = () => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const sanitizedTopic = topic
      ? topic.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 40)
      : "researchmind-report";
    link.download = `${sanitizedTopic}-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      type: "success",
      title: "Report Downloaded",
      description: `Saved as ${link.download}`,
    });
  };

  const handleExportPDF = () => {
    if (!report) return;
    toast({
      type: "info",
      title: "Generating Print Preview",
      description: "Select 'Save as PDF' in the destination dropdown.",
    });
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Extract headings for Table of Contents dropdown
  const headings = useMemo(() => {
    if (!report) return [];
    const lines = report.split("\n");
    const list: Array<{ id: string; text: string; level: number }> = [];
    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const text = match[2].trim().replace(/\*\*/g, "").replace(/`/g, "");
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        list.push({ id, text, level: match[1].length });
      }
    });
    return list;
  }, [report]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setShowTocDropdown(false);
    }
  };

  const wordCount = report ? report.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 220));

  return (
    <div
      className={`relative flex flex-col transition-all duration-200 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-[#0a0a0f] p-4 sm:p-8"
          : "w-full max-w-4xl h-full min-h-0"
      }`}
    >
      {/* Framed Card Container */}
      <div className="w-full h-full min-h-0 flex flex-col rounded-2xl border border-white/10 bg-white/[0.015] shadow-lg backdrop-blur-md overflow-hidden">
        {/* Docked Card Header Toolbar */}
        <div className="shrink-0 px-4 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between no-print gap-2">
          {/* Metadata & TOC dropdown */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[11px] font-mono text-text-muted truncate">
              {report ? `${wordCount.toLocaleString()} words · ${readTime} min read` : "Synthesizing report…"}
            </span>

            {report && headings.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowTocDropdown(!showTocDropdown)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-text-secondary hover:text-text-primary bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all"
                >
                  <List className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sections ({headings.length})</span>
                  <ChevronDown className="w-3 h-3 text-text-muted" />
                </button>

                {showTocDropdown && (
                  <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-white/10 bg-[#12121a] p-1.5 shadow-2xl z-40 text-xs font-sans max-h-72 overflow-y-auto">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase text-text-muted border-b border-white/5 mb-1">
                      Jump to Section
                    </div>
                    {headings.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => scrollToHeading(h.id)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs truncate transition-colors text-text-secondary hover:text-amber-300 hover:bg-white/5 ${
                          h.level === 3 ? "pl-4 text-[11px]" : "font-medium"
                        }`}
                      >
                        {h.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          {report && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleCopyMarkdown}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                title="Copy Markdown"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={handleDownloadMD}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                title="Download .md File"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExportPDF}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                title="Print / Export PDF"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Card Inside Content: Scrollable */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 sm:p-10 select-text scroll-smooth"
        >
          {!isWriterDone && !report ? (
            <WaitingState currentAgent={currentAgent} topic={topic} />
          ) : (
            <article className="report-canvas w-full max-w-[72ch] mx-auto">
              <div className="report-content prose prose-invert max-w-none text-text-primary text-[15px] sm:text-base leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => {
                      const text = String(children);
                      const id = text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/\s+/g, "-");
                      return (
                        <h1
                          id={id}
                          className="font-syne font-bold text-2xl sm:text-3xl text-text-primary tracking-tight mt-2 mb-6 pb-4 border-b border-white/10 leading-snug break-words"
                        >
                          {children}
                        </h1>
                      );
                    },
                    h2: ({ children }) => {
                      const text = String(children);
                      const id = text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/\s+/g, "-");
                      return (
                        <h2
                          id={id}
                          className="font-syne font-bold text-lg sm:text-xl text-text-primary tracking-tight mt-8 mb-3 pb-1.5 border-b border-white/5 leading-snug scroll-mt-6 break-words"
                        >
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ children }) => {
                      const text = String(children);
                      const id = text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/\s+/g, "-");
                      return (
                        <h3
                          id={id}
                          className="font-syne font-semibold text-sm sm:text-base text-amber-300 mt-5 mb-2 leading-snug scroll-mt-6 break-words"
                        >
                          {children}
                        </h3>
                      );
                    },
                    p: ({ children }) => (
                  <p className="text-text-secondary leading-relaxed mb-4 text-[14px] sm:text-[15px]">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 space-y-1.5 mb-4 text-text-secondary text-[14px] sm:text-[15px]">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 space-y-1.5 mb-4 text-text-secondary text-[14px] sm:text-[15px]">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed pl-1">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-amber-500/70 bg-amber-500/[0.03] px-3.5 py-2.5 rounded-r-lg my-4 text-text-secondary italic text-xs sm:text-sm">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="w-full overflow-x-auto my-5 rounded-xl border border-white/10 bg-black/30">
                    <table className="w-full text-left text-xs font-sans border-collapse">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-white/[0.04] border-b border-white/10 text-text-primary uppercase tracking-wider text-[10px] font-mono">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-white/5 text-text-secondary">
                    {children}
                  </tbody>
                ),
                th: ({ children }) => (
                  <th className="px-3.5 py-2.5 font-semibold text-text-primary">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3.5 py-2.5 leading-relaxed">{children}</td>
                ),
                hr: () => (
                  <hr className="my-6 border-t border-white/10" />
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 underline underline-offset-4 font-medium inline-flex items-center gap-0.5 transition-colors"
                  >
                    <span>{children}</span>
                    <ExternalLink className="w-2.5 h-2.5 ml-0.5 inline opacity-60" />
                  </a>
                ),
                code: ({ className, children }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-white/10 text-amber-300 font-mono text-[12px] border border-white/5">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <div className="my-4 rounded-xl border border-white/10 bg-[#08080d] p-3.5 overflow-x-auto font-mono text-xs leading-relaxed text-amber-200">
                      <code>{children}</code>
                    </div>
                  );
                },
              }}
            >
              {report}
            </ReactMarkdown>
          </div>
        </article>
      )}
        </div>
      </div>
    </div>
  );
}
