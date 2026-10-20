"use client";

import React, { useMemo } from "react";
import { List, ChevronRight } from "lucide-react";
import { useScrollSpy } from "@/hooks/useScrollSpy";

interface TableOfContentsProps {
  markdown: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ markdown }: TableOfContentsProps) {
  // Extract h2 and h3 headings
  const items: TocItem[] = useMemo(() => {
    if (!markdown) return [];
    const lines = markdown.split("\n");
    const result: TocItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/\*\*/g, "").replace(/`/g, "");
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");

        result.push({ id, text, level });
      }
    });

    return result;
  }, [markdown]);

  const headingIds = useMemo(() => items.map((i) => i.id), [items]);
  const activeId = useScrollSpy(headingIds, 120);

  if (items.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="w-full glass-panel rounded-2xl p-4 border border-white/5 space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-text-muted pb-2 border-b border-white/5 font-medium">
        <List className="w-3.5 h-3.5 text-amber-400" />
        <span>Contents</span>
      </div>

      <div className="space-y-1 text-xs font-sans max-h-[60vh] overflow-y-auto pr-1">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToHeading(item.id)}
              className={`w-full text-left py-1.5 px-2 rounded-lg transition-all flex items-center justify-between text-xs leading-snug group ${
                item.level === 3 ? "pl-4 text-[11px]" : ""
              } ${
                isActive
                  ? "bg-amber-500/15 text-amber-300 font-semibold border-l-2 border-amber-500 pl-2.5"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
              }`}
            >
              <span className="truncate">{item.text}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 text-amber-400 shrink-0 ml-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
